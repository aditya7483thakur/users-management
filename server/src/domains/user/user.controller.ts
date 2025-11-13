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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get current user profile
  @Get('me')
  async getProfile(@Request() req) {
    try {
      const user = await this.userService.getUser(req.user.sub);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update user
  @Patch('me')
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    try {
      const updatedUser = await this.userService.updateUser(req.user.sub, dto);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      const result = await this.userService.verifyEmailUpdate(token);
      return result;
    } catch (error) {
      console.error('Error verifying email update:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to verify email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get all users (admin)
  @Get()
  async getAllUsers(
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string,
  ) {
    try {
      const limitNumber = Number(limit);
      const users = await this.userService.getAllUsers(limitNumber, cursor);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete other's account
  @Delete('me')
  async deleteMe(@Request() req) {
    try {
      const result = await this.userService.deleteUser(req.user.sub);
      return result;
    } catch (error) {
      console.error('Error deleting current user:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete your account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete other's account
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.userService.deleteUser(id);
      return result;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
