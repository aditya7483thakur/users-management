// src/domains/user/repositories/user.repository.ts
import { BaseRepository } from 'src/infra/base.repository';
import { User, UserDocument } from '../schemas/user.schema';

export interface UserRepository extends BaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findAllWithPagination(filter: any, limit: number): Promise<UserDocument[]>;
  findByIdWithTheme(userId: string): Promise<UserDocument | null>;
}
