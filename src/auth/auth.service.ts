import { PrismaService } from 'nestjs-prisma';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { User } from '../users/models/user.model';
import { toGraphQLUser } from '../common/mapper/user.mapper';
import { JwtDto } from './dto/jwt.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(payload: SignupInput): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(payload.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          password: hashedPassword,
        },
      });

      return this.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  async login(email: string, password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(password, user.password);

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  async validateUser(userId: string): Promise<User> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id: userId } });
    return toGraphQLUser(prismaUser);
  }

  async getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return toGraphQLUser(prismaUser);
  }

  generateTokens(user: { id: string; email: string; username: string }): Token {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }), // ví dụ
    };
  }

  async refreshToken(token: string) {
    try {
      // 1. Verify refresh token
      const payload: JwtDto = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 2. Check user tồn tại và không bị khóa
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.status === UserStatus.ACTIVE) {
        throw new UnauthorizedException('User has been banned');
      }

      // 3. Sinh lại accessToken/refreshToken mới từ data user thật trong DB
      return this.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
        // role: user.role,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateOrCreateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    username: string;
    avatar: string;
  }) {
    // 1. Tìm user theo googleId hoặc email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    // 2. Nếu chưa có, tạo mới user (không cần password!)
    if (!user) {
      try {
        console.log('Check Input', googleUser);
        user = await this.userService.createUser({
          googleId: googleUser.googleId,
          email: googleUser.email,
          username: googleUser.username,
          avatarUrl: googleUser.avatar,
          // Các trường khác nếu cần
        });
      } catch (e) {
        console.log('Err:', e);
        throw new ConflictException('Could not create Google user!');
      }
    }

    // 3. Sinh JWT trả về
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return this.generateTokens(payload);
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }
}
