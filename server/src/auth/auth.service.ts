import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Token, TokenDocument, TokenType } from './schemas/token.schema';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
  ) {}

  // -------------------------
  // 1️⃣ Register user & send verification email
  // -------------------------
  async register(name: string, email: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email already exists');

    const user = await this.userModel.create({
      name,
      email,
      passwordHash: '',
      isVerified: false,
    });

    // Generate verification token
    const token = uuidv4();
    await this.tokenModel.create({
      user: user._id,
      token,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
    });

    // TODO: send email with verification link containing token
    return { message: 'Verification email sent', token }; // token returned for testing
  }

  // -------------------------
  // 2️⃣ Login
  // -------------------------
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.isVerified)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    console.log(1);
    const jwt = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    });
    console.log(2);
    return { token: jwt };
  }

  // -------------------------
  // 3️⃣ Forgot password → send reset email
  // -------------------------
  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const token = uuidv4();
    await this.tokenModel.create({
      user: user._id,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1h expiry
    });

    // TODO: send email with reset link containing token
    return { message: 'Password reset email sent', token }; // token returned for testing
  }

  // -------------------------
  // 4️⃣ Unified setPassword → handles first-time verification & password reset
  // -------------------------
  async setPassword(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    // Find the token (either EMAIL_VERIFICATION or PASSWORD_RESET)
    const record = await this.tokenModel.findOne({
      token,
      type: { $in: [TokenType.EMAIL_VERIFICATION, TokenType.PASSWORD_RESET] },
    });
    if (!record) throw new BadRequestException('Invalid or expired token');

    const user = await this.userModel.findById(record.user);
    if (!user) throw new NotFoundException('User not found');

    // Hash and set the password
    const hash = await bcrypt.hash(password, 10);
    user.passwordHash = hash;

    // If first-time registration, mark as verified
    if (record.type === TokenType.EMAIL_VERIFICATION) {
      user.isVerified = true;
    }

    await user.save();
    await record.deleteOne();

    return { message: 'Password set successfully' };
  }
}
