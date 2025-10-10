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
import { UpdateUserDto } from './dto/update-user.dto';

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
    const jti = uuidv4();
    const jwt = this.jwtService.sign({
      sub: user._id.toString(),
      jti,
    });

    // Save JWT in user's jwt array
    user.jwt.push(jti);
    await user.save();
    return { token: jwt };
  }

  async logout(userId: string, currentToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Remove the current token from the jwt array
    user.jwt = user.jwt.filter((token) => token !== currentToken);

    await user.save();

    return { message: 'Logged out successfully' };
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

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
    currentToken: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Old password is incorrect');

    // Hash and set the new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    // Keep only the current JWT, log out all other sessions
    user.jwt = [currentToken];

    await user.save();

    return { message: 'Password changed successfully' };
  }

  // -------------------------
  // 5️⃣ Get user profile
  // -------------------------
  async getUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash -jwt');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -------------------------
  // 6️⃣ Update user profile
  // -------------------------
  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .select('-passwordHash -jwt');

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -------------------------
  // 7️⃣ Get all users
  // -------------------------
  async getAllUsers() {
    return this.userModel.find().select('-passwordHash -jwt -email');
  }

  // -------------------------
  // 8️⃣ Delete user
  // -------------------------
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  // -------------------------
  // 9️⃣ Change theme
  // -------------------------
  async changeTheme(userId: string, theme: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { theme }, { new: true })
      .select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
