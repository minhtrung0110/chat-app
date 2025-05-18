import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenInput } from './dto/refresh-token.input';

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
}
