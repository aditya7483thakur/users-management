import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { sendEmail } from 'src/utils/sendEmail';
import { TokenType } from 'src/enums/auth.enums';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDocument } from '../user/schemas/user.schema';
import { Token, TokenDocument } from '../user/schemas/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
@Injectable()
export class UserService {
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
    const verificationLink = `http://localhost:3000/set-password?token=${token}`;
    await sendEmail(
      user.email,
      'Complete Your Registration - Set Your Password',
      `
        <p>Hi ${name},</p>
        <p>Thanks for registering! Click the button below to set your password and complete registration:</p>
        <a href="${verificationLink}" 
           style="
             display: inline-block;
             padding: 10px 20px;
             font-size: 16px;
             color: white;
             background-color: #2679f3;
             text-decoration: none;
             border-radius: 5px;
           ">
           Set My Password
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    );
    return { message: 'Verification email sent', token, ok: true };
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

    user.jwt.push(jti);
    await user.save();
    return { message: 'Login successful!', token: jwt, ok: true };
  }

  async logout(userId: string, currentToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    // Remove the current token from the jwt array
    user.jwt = user.jwt.filter((token) => token !== currentToken);

    await user.save();

    return { message: 'Logged out successfully', ok: true };
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

    const resetLink = `http://localhost:3000/set-password?token=${token}`;

    await sendEmail(
      user.email,
      'Reset Your Password',
      `
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <a href="${resetLink}" 
       style="
         display: inline-block;
         padding: 10px 20px;
         font-size: 16px;
         color: white;
         background-color: #2679f3;
         text-decoration: none;
         border-radius: 5px;
       ">
       Reset My Password
    </a>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `,
    );

    return { message: 'Password reset email sent', token, ok: true };
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

    return { message: 'Password set successfully', ok: true };
  }

  // change password for logged-in users
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

    return { message: 'Password changed successfully', ok: true };
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
    return { message: 'User updated successfully', user, ok: true };
  }

  // -------------------------
  // 7️⃣ Get all users
  // -------------------------
  async getAllUsers() {
    const chance = Math.random();

    const users =
      chance < 0.5
        ? []
        : await this.userModel.find().select('-passwordHash -jwt');

    return {
      ok: true,
      data: users.length > 0 ? users : null,
      message:
        users.length > 0 ? 'Users fetched successfully' : 'No users found',
    };
  }

  // -------------------------
  // 8️⃣ Delete user
  // -------------------------
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully', ok: true };
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
