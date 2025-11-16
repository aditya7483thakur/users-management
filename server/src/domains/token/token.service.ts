import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { TokenRepository } from './interfaces/token.repository';
import { TokenType } from 'src/enums/auth.enums';
import { TokenDocument } from './schemas/token.schema';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TOKEN_REPOSITORY')
    private readonly tokenRepository: TokenRepository,
  ) {}

  async createToken(data: Partial<TokenDocument>) {
    return this.tokenRepository.create(data);
  }

  async deleteToken(id: string) {
    return this.tokenRepository.deleteToken(id);
  }

  async findValidToken(
    token: string,
    allowedTypes: TokenType[],
  ): Promise<TokenDocument> {
    const record = await this.tokenRepository.findValidToken(
      token,
      allowedTypes,
    );
    if (!record) {
      throw new BadRequestException('Invalid or expired token');
    }
    return record as TokenDocument;
  }
}
