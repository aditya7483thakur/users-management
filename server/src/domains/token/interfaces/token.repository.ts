import { Token, TokenDocument } from '../schemas/token.schema';
import { BaseRepository } from 'src/infra/base.repository';
import { TokenType } from 'src/enums/auth.enums';
export interface TokenRepository extends BaseRepository<TokenDocument> {
  findValidToken(token: string, types: TokenType[]): Promise<Token | null>;
  deleteToken(token: string): Promise<void>;
  deleteTokensForUser(userId: string, type?: TokenType): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
