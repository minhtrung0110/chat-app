import { PrismaService } from 'nestjs-prisma';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  // Lấy thông tin user theo id
  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Lấy danh sách tất cả user (nên có phân trang thực tế)
  async findAllUsers() {
    return this.prisma.user.findMany();
  }

  // Tạo mới user (basic, bạn có thể bổ sung validate/email unique...)
  async createUser(data: any) {
    // Nếu có password, hash password
    if (data.password) {
      data.password = await this.passwordService.hashPassword(data.password);
    }
    return this.prisma.user.create({ data });
  }

  // Cập nhật user
  async updateUser(userId: string, newUserData: UpdateUserInput) {
    // Nếu có password, không cho phép update ở đây
    if ((newUserData as any).password) {
      throw new BadRequestException('Cannot update password in this route');
    }
    // Kiểm tra tồn tại
    await this.findUserById(userId);

    return this.prisma.user.update({
      data: newUserData,
      where: { id: userId },
    });
  }

  // Đổi mật khẩu user
  async changePassword(userId: string, userPassword: string, changePassword: ChangePasswordInput) {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword,
    );
    if (!passwordValid) {
      throw new BadRequestException('Invalid old password');
    }
    if (changePassword.oldPassword === changePassword.newPassword) {
      throw new BadRequestException('New password must be different from old password');
    }

    const hashedPassword = await this.passwordService.hashPassword(changePassword.newPassword);

    return this.prisma.user.update({
      data: { password: hashedPassword },
      where: { id: userId },
    });
  }

  // Xoá user
  async deleteUser(userId: string) {
    // Kiểm tra tồn tại
    await this.findUserById(userId);

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
