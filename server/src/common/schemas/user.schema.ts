import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document & { _id: string };

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

  // 🔗 Reference to the Theme schema

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: false,
  })
  themeRef: string;

  @Prop({ type: [String], default: [] })
  jwt: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
