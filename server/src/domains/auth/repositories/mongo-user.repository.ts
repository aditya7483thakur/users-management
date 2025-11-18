import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/common/schemas/user.schema';
import { UserRepository } from '../interfaces/user.repository';
import { MongoRepository } from 'src/infra/database/mongo.repository';
export class UserMongoRepository
  extends MongoRepository<UserDocument>
  implements UserRepository
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
}
