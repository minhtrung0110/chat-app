import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Đăng ký user mới
  @Post('register')
  async register(@Body() registerDto: SignupInput) {
    return this.authService.createUser(registerDto);
  }

  // Đăng nhập
  @Post('login')
  async login(@Body() loginDto: LoginInput) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // Lấy thông tin profile từ token
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return req.user;
  }
  // Refresh token
  @Post('refresh-token')
  async refreshToken(@Body() { token }: RefreshTokenInput) {
    return this.authService.refreshToken(token);
  }

  // Bước 1: Redirect user đến Google login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google Passport sẽ handle chuyển hướng, không cần code gì ở đây
  }

  // Bước 2: Google redirect về callback, handle user info
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    // req.user có info từ GoogleStrategy.validate
    // Gọi service để xử lý user, trả về JWT
    console.log('Req', req.user);
    const userData = req.user as any;
    const userInput = {
      googleId: userData.googleId,
      email: userData.email,
      username: userData?.email?.split('@')[0],
      avatar: userData.avatar || '',
    };
    const jwt = await this.authService.validateOrCreateGoogleUser(userInput);

    // Nếu app thuần API: trả thẳng token
    // return jwt;

    // Nếu muốn redirect về frontend kèm token:
    // res.redirect(`${process.env.FRONTEND_URL}/auth/callback?access_token=${jwt.accessToken}`);
    // return;

    // Trả về token cho client (tùy nhu cầu của bạn):
    return jwt;
  }
}
