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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ChangeThemeDto } from './dto/theme-change.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { changePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register user → sends email verification link
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email);
  }

  // Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Forgot Password → sends reset email
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // Set Password → handles both first-time verification & password reset
  @Post('set-password')
  async setPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.setPassword(
      dto.token,
      dto.password,
      dto.confirmPassword,
    );
  }

  // Get current user profile

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getUser(req.user.sub);
  }

  // Update user
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async changePassword(@Request() req, @Body() dto: changePasswordDto) {
    const currentToken = req.user.jti;
    return this.authService.changePassword(
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

    return this.authService.logout(userId, currentToken);
  }

  // Get all users (admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // Delete other's account
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Request() req) {
    return this.authService.deleteUser(req.user.sub);
  }

  // Delete other's account
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  // Change theme
  @UseGuards(JwtAuthGuard)
  @Patch('theme')
  async changeTheme(@Request() req, @Body() dto: ChangeThemeDto) {
    return this.authService.changeTheme(req.user.sub, dto.theme);
  }
}
