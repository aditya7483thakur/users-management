import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from 'src/infra/database/mongo.repository';
import { Token, TokenDocument } from '../../../common/schemas/token.schema';
import { TokenRepository } from '../interfaces/token.repository';
import { TokenType } from 'src/enums/auth.enums';

@Injectable()
export class TokenMongoRepository
  extends MongoRepository<TokenDocument>
  implements TokenRepository
{
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
  ) {
    super(tokenModel);
  }

  async findValidToken(
    token: string,
    types: TokenType[],
  ): Promise<TokenDocument | null> {
    return this.tokenModel.findOne({
      token,
      type: { $in: types },
      expiresAt: { $gt: new Date() },
    });
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokenModel.deleteOne({ token });
  }
}
