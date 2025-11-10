// src/domains/user/repositories/user.repository.ts
import { BaseRepository } from 'src/common/base.repository';
import { User } from '../schemas/user.schema';

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findAllWithPagination(filter: any, limit: number): Promise<User[]>;
}
