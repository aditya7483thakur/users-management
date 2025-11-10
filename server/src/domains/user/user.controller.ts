import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Delete,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { changePasswordDto } from '../auth/dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get current user profile
  @Get('me')
  async getProfile(@Request() req) {
    return this.userService.getUser(req.user.sub);
  }

  // Update user
  @Patch('me')
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(req.user.sub, dto);
  }

  @Patch('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmailUpdate(token);
  }

  // Get all users (admin)
  @Get()
  async getAllUsers(
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string,
  ) {
    const limitNumber = Number(limit);
    return this.userService.getAllUsers(limitNumber, cursor);
  }

  // Delete other's account
  @Delete('me')
  async deleteMe(@Request() req) {
    return this.userService.deleteUser(req.user.sub);
  }

  // Delete other's account
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
