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
import { UserService } from '../user.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { changePasswordDto } from '../dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Forgot Password → sends reset email
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.userService.forgotPassword(dto.email);
  }

  // Set Password → handles both first-time verification & password reset
  @Post('set-password')
  async setPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.userService.setPassword(
      token,
      dto.password,
      dto.confirmPassword,
    );
  }

  // Get current user profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.userService.getUser(req.user.sub);
  }

  // Update user
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(req.user.sub, dto);
  }

  @Patch('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmailUpdate(token);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async changePassword(@Request() req, @Body() dto: changePasswordDto) {
    const currentToken = req.user.jti;
    return this.userService.changePassword(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
      dto.confirmPassword,
      currentToken,
    );
  }

  // Get all users (admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string,
  ) {
    const limitNumber = Number(limit);
    return this.userService.getAllUsers(limitNumber, cursor);
  }

  // Delete other's account
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Request() req) {
    return this.userService.deleteUser(req.user.sub);
  }

  // Delete other's account
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Get('captcha')
  async getCaptcha() {
    const captcha = await this.userService.generateCaptcha();
    return captcha;
    // { captchaId, svg }
  }
}
