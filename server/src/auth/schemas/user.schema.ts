import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & { _id: string };

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  RED = 'red',
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/, // simple email regex
  })
  email: string;

  @Prop({
    required: false,
  })
  passwordHash: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    enum: Theme,
    default: Theme.LIGHT,
  })
  theme: Theme;

  @Prop({ type: [String], default: [] })
  jwt: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
