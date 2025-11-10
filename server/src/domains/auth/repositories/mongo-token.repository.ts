import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from 'src/common/infra/mongo.repository';
import { Token, TokenDocument } from '../schemas/token.schema';
import { TokenRepository } from '../interfaces/token.repository';
import { TokenType } from 'src/enums/auth.enums';

@Injectable()
export class TokenMongoRepository
  extends MongoRepository<Token>
  implements TokenRepository
{
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
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

  async deleteTokensForUser(userId: string, type?: TokenType): Promise<void> {
    const query: any = { user: userId };
    if (type) query.type = type;
    await this.tokenModel.deleteMany(query);
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.tokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}
