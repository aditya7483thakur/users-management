// src/auth/controllers/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -------------------------
  // 1️⃣ Register user → sends email verification link
  // -------------------------
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email);
  }

  // -------------------------
  // 2️⃣ Login
  // -------------------------
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // -------------------------
  // 3️⃣ Forgot Password → sends reset email
  // -------------------------
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // -------------------------
  // 4️⃣ Set Password → handles both first-time verification & password reset
  // -------------------------
  @Post('set-password')
  async setPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.setPassword(
      dto.token,
      dto.password,
      dto.confirmPassword,
    );
  }

  // -------------------------
  //  get current user profile
  // -------------------------

  // -------------------------
  //  update user
  // -------------------------

  // -------------------------
  //  get all users
  // -------------------------

  // ----------------------------------------
  //  delete an user (me or any other user)
  // ----------------------------------------

  // -------------------------
  //  change theme
  // -------------------------
}
