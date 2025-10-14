import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UserService) {}

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

  // Logout
  @UseGuards(JwtAuthGuard)
  @Patch('logout')
  async logout(@Request() req) {
    const userId = req.user.sub;
    const currentToken = req.user.jti;

    return this.authService.logout(userId, currentToken);
  }
}
