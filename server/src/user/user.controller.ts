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
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { ForgotPasswordDto } from '../user/dto/forgot-password.dto';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import { JwtAuthGuard } from '../user/guard/jwt-auth.guard';
import { ChangeThemeDto } from '../user/dto/theme-change.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { changePasswordDto } from '../user/dto/change-password.dto';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Register user → sends email verification link
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto.name, dto.email);
  }

  // Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto.email, dto.password);
  }

  // Forgot Password → sends reset email
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.userService.forgotPassword(dto.email);
  }

  // Set Password → handles both first-time verification & password reset
  @Post('set-password')
  async setPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.setPassword(
      dto.token,
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

  // Logout
  @UseGuards(JwtAuthGuard)
  @Patch('logout')
  async logout(@Request() req) {
    const userId = req.user.sub;
    const currentToken = req.user.jti;

    return this.userService.logout(userId, currentToken);
  }

  // Get all users (admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
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

  // Change theme
  @UseGuards(JwtAuthGuard)
  @Patch('theme')
  async changeTheme(@Request() req, @Body() dto: ChangeThemeDto) {
    return this.userService.changeTheme(req.user.sub, dto.theme);
  }
}
