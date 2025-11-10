import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { changePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Register user → sends email verification link
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.captchaId,
      dto.captchaAnswer,
    );
  }

  // Forgot Password → sends reset email

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // Set Password → handles both first-time verification & password reset

  @Public()
  @Post('set-password')
  async setPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.setPassword(
      token,
      dto.password,
      dto.confirmPassword,
    );
  }

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

  // Login

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.email,
      dto.password,
      dto.captchaId,
      dto.captchaAnswer,
    );
  }

  @Public()
  @Get('captcha')
  async getCaptcha(@Request() req) {
    return this.authService.generateCaptcha();
  }

  // Logout
  @Patch('logout')
  async logout(@Request() req) {
    const userId = req.user.sub;
    const currentToken = req.user.jti;

    return this.authService.logout(userId, currentToken);
  }
}
