import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
    try {
      const user = await this.authService.register(
        dto.name,
        dto.email,
        dto.captchaId,
        dto.captchaAnswer,
      );
      return user;
    } catch (error) {
      console.error('Error during registration:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Forgot Password → sends reset email

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      const response = await this.authService.forgotPassword(dto.email);
      return response;
    } catch (error) {
      console.error('Error during forgot-password:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to process forgot password request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Set Password → handles both first-time verification & password reset

  @Public()
  @Post('set-password')
  async setPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    try {
      const result = await this.authService.setPassword(
        token,
        dto.password,
        dto.confirmPassword,
      );
      return result;
    } catch (error) {
      console.error('Error during set-password:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to set password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('update-password')
  async changePassword(@Request() req, @Body() dto: changePasswordDto) {
    try {
      const currentToken = req.user.jti;
      const result = await this.authService.changePassword(
        req.user.sub,
        dto.oldPassword,
        dto.newPassword,
        dto.confirmPassword,
        currentToken,
      );
      return result;
    } catch (error) {
      console.error('Error updating password:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Login

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(
        dto.email,
        dto.password,
        dto.captchaId,
        dto.captchaAnswer,
      );
      return result;
    } catch (error) {
      console.error('Error during login:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('generate-captcha')
  async getCaptcha(@Request() req) {
    try {
      const captcha = await this.authService.generateCaptcha();
      return captcha;
    } catch (error) {
      console.error('Error generating captcha:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to generate captcha',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Logout
  @Patch('logout')
  async logout(@Request() req) {
    try {
      const userId = req.user.sub;
      const currentToken = req.user.jti;

      const result = await this.authService.logout(userId, currentToken);
      return result;
    } catch (error) {
      console.error('Error during logout:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to logout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
