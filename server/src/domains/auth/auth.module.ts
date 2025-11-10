import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './schemas/token.schema';
import { TokenMongoRepository } from './repositories/mongo-token.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: 'TOKEN_REPOSITORY', useExisting: TokenMongoRepository },
  ],
})
export class AuthModule {}
