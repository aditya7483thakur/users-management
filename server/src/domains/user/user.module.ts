import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserMongoRepository } from './repositories/mongo-user.repository';
import { TokenModule } from '../token/token.module';
import { EmailModule } from '../email/email.module';
import { AppConfigModule } from 'src/config/config.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TokenModule,
    EmailModule,
    AppConfigModule,
  ],
  providers: [
    UserService,
    UserMongoRepository,
    { provide: 'USER_REPOSITORY', useClass: UserMongoRepository },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
