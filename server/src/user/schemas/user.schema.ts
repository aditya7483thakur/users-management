import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Theme } from 'src/enums/auth.enums';

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

  @Prop({
    type: String,
    required: true,
    default: '#ffffff',
    match: /^#([0-9A-F]{3}){1,2}$/i, // validates hex code
  })
  theme: string;

  @Prop({ type: [String], default: [] })
  jwt: string[];

  @Prop({
    type: [
      {
        _id: false,
        name: { type: String, required: true, trim: true },
        hex: {
          type: String,
          required: true,
          match: /^#([0-9A-F]{3}){1,2}$/i,
        },
      },
    ],
    default: [],
  })
  customThemes: { name: string; hex: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
