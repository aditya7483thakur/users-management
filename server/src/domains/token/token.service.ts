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

  async createToken(data: {
    user: string | null;
    token: string;
    type: TokenType;
    expiresAt?: Date;
    newEmail?: string;
    answer?: number;
  }) {
    return this.tokenRepository.create(data as any);
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
