import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThemeDocument = Theme & Document & { _id: string };

@Schema({ timestamps: true })
export class Theme {
  // The main theme color
  @Prop({
    type: String,
    required: true,
    default: '#ffffff',
    match: /^#([0-9A-F]{3}){1,2}$/i, // validates hex code
  })
  theme: string;

  // The list of custom themes user created
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

export const ThemeSchema = SchemaFactory.createForClass(Theme);
