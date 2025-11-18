import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/infra/base.repository';

@Injectable()
export class MongoRepository<T> implements BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return (await created.save()).toObject();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(filter: any = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new Error(`Document with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
