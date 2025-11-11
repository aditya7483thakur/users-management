import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from '../token/schemas/token.schema';
import { TokenMongoRepository } from './repositories/mongo-token.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [
    TokenService,
    TokenMongoRepository,
    { provide: 'TOKEN_REPOSITORY', useClass: TokenMongoRepository },
  ],
  exports: [TokenService],
})
export class TokenModule {}
