import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../common/strategy/jwt.strategy';
import { UserController } from './user.controller';
import { ThemeController } from './controllers/theme.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserMongoRepository } from './repositories/mongo-user.repository';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    UserService,
    JwtStrategy,
    JwtAuthGuard,

    { provide: 'USER_REPOSITORY', useExisting: UserMongoRepository },
  ],
  controllers: [UserController, ThemeController, AuthController],
  exports: [UserService],
})
export class UserModule {}
