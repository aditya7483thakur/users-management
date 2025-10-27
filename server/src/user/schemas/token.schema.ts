import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TokenType } from 'src/enums/auth.enums';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  token: string;

  @Prop({
    type: String,
    required: true,
    enum: TokenType,
  })
  type: TokenType;

  @Prop({ trim: true })
  newEmail?: string;

  @Prop()
  answer?: number;

  @Prop({
    required: true,
  })
  expiresAt: Date;
}

// Create schema
export const TokenSchema = SchemaFactory.createForClass(Token);

// TTL index for automatic deletion
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
