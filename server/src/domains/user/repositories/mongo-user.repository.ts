import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/domains/user/schemas/user.schema';
import { UserRepository } from '../interfaces/user.repository';
import { MongoRepository } from 'src/common/infra/mongo.repository';
export class UserMongoRepository
  extends MongoRepository<User>
  implements UserRepository
{
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async findAllWithPagination(filter: any, limit: number): Promise<User[]> {
    return this.model
      .find(filter)
      .select('-passwordHash -jwt')
      .sort({ _id: 1 })
      .limit(limit)
      .exec();
  }
}
