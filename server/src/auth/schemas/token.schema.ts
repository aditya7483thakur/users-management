import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Token & Document;

export enum TokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Schema({ timestamps: true })
export class Token {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  token: string;

  @Prop({
    required: true,
    enum: TokenType,
  })
  type: TokenType;

  @Prop({
    required: true,
  })
  expiresAt: Date;
}

// Create schema
export const TokenSchema = SchemaFactory.createForClass(Token);

// TTL index for automatic deletion
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
