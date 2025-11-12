import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { ThemeModule } from '../theme/theme.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TokenModule, UserModule, ThemeModule, CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
