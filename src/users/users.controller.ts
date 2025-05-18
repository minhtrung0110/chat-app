import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';
import { ChangePasswordInput } from './dto/change-password.input';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './models/user.model';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy thông tin tài khoản của chính mình (từ JWT)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.findUserById(userId);
  }

  // Lấy danh sách tất cả user
  @Get()
  async getAllUsers() {
    return this.usersService.findAllUsers();
  }

  // Lấy thông tin user theo id
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  // Tạo mới user (chỉ dành cho admin, hoặc public nếu cho đăng ký)
  @Post()
  async createUser(@Body() createUserInput: User) {
    return this.usersService.createUser(createUserInput);
  }

  // Cập nhật profile của chính mình
  @Patch('update:id')
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() newUserData: UpdateUserInput,
  ) {
    return this.usersService.updateUser(id, newUserData);
  }

  // Đổi mật khẩu của chính mình
  @Patch('change-password')
  async changePassword(@Req() req: Request, @Body() changePassword: ChangePasswordInput) {
    const userId = (req.user as any).id;
    const currentUser = await this.usersService.findUserById(userId);
    return this.usersService.changePassword(userId, currentUser.password, changePassword);
  }

  // Xóa user theo id (chỉ admin nên dùng)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
