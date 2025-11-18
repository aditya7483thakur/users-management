// src/domains/user/repositories/user.repository.ts
import { BaseRepository } from 'src/infra/base.repository';
import { User, UserDocument } from '../../../common/schemas/user.schema';

export interface UserRepository extends BaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
