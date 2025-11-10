import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserMongoRepository } from './repositories/mongo-user.repository';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  providers: [
    UserService,

    { provide: 'USER_REPOSITORY', useExisting: UserMongoRepository },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
