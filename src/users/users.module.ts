import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';
import { UserController } from './users.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UsersResolver, UsersService, PasswordService],
})
export class UsersModule {}
