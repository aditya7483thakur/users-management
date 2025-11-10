import { Module } from '@nestjs/common';
import { MongoRepository } from '../mongo.repository';

@Module({
  providers: [MongoRepository],
  exports: [MongoRepository],
})
export class DatabaseModule {}
