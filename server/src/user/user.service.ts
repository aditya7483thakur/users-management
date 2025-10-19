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
    const verificationLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
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

    const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');

    const valid = await bcrypt.compare(decodedPassword, user.passwordHash);
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

    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

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
    // 🔹 Decode Base64 passwords
    const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');
    const decodedConfirmPassword = Buffer.from(
      confirmPassword,
      'base64',
    ).toString('utf-8');

    // 🔹 Check if passwords match
    if (decodedPassword !== decodedConfirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    // 🔹 Find the token (EMAIL_VERIFICATION or PASSWORD_RESET)
    const record = await this.tokenModel.findOne({
      token,
      type: { $in: [TokenType.EMAIL_VERIFICATION, TokenType.PASSWORD_RESET] },
    });
    if (!record) throw new BadRequestException('Invalid or expired token');

    // 🔹 Find the user
    const user = await this.userModel.findById(record.user);
    if (!user) throw new NotFoundException('User not found');

    // 🔹 Check if new password is same as old password
    const isSameAsOld = await bcrypt.compare(
      decodedPassword,
      user.passwordHash,
    );
    if (isSameAsOld) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    // 🔹 Hash and set the new password
    user.passwordHash = await bcrypt.hash(decodedPassword, 10);

    // 🔹 If first-time registration, mark as verified
    if (record.type === TokenType.EMAIL_VERIFICATION) {
      user.isVerified = true;
    }

    // 🔹 Log out all sessions
    user.jwt = [];

    await user.save();
    await record.deleteOne();

    return { message: 'Password set successfully', ok: true };
  }

  async verifyEmailUpdate(token: string) {
    // 1️⃣ Find the token and ensure it's for EMAIL_UPDATE
    const record = await this.tokenModel.findOne({
      token,
      type: TokenType.EMAIL_UPDATE,
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired token');
    }

    // 2️⃣ Find the associated user
    const user = await this.userModel.findById(record.user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3️⃣ Get new email stored in token’s data field
    // Assuming you stored it in token.data.newEmail when generating token
    const newEmail = record.newEmail;

    if (!newEmail) {
      throw new BadRequestException('Token does not contain a valid new email');
    }

    // 4️⃣ Double-check no other user already has this email
    const existing = await this.userModel.findOne({ email: newEmail });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // 5️⃣ Update the user's email
    user.email = newEmail;
    await user.save();

    // 6️⃣ Delete token after successful verification
    await record.deleteOne();

    return { message: 'Email updated successfully', ok: true };
  }

  // change password for logged-in users
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
    currentToken: string,
  ) {
    // 🔹 Decode all Base64 passwords
    const decodedOldPassword = Buffer.from(oldPassword, 'base64').toString(
      'utf-8',
    );
    const decodedNewPassword = Buffer.from(newPassword, 'base64').toString(
      'utf-8',
    );
    const decodedConfirmPassword = Buffer.from(
      confirmPassword,
      'base64',
    ).toString('utf-8');

    // Check new password match
    if (decodedNewPassword !== decodedConfirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    // Ensure new password is not same as old password
    if (decodedNewPassword === decodedOldPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const isValid = await bcrypt.compare(decodedOldPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Old password is incorrect');

    // Hash and set the new password
    user.passwordHash = await bcrypt.hash(decodedNewPassword, 10);

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
    // 🧩 Guard: empty body → no update
    if (!dto.name && !dto.email) {
      return { message: 'No changes detected', ok: true };
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let nameChanged = false;
    let emailVerificationTriggered = false;

    // ---------- HANDLE NAME ----------
    if (dto.name && dto.name !== user.name) {
      user.name = dto.name;
      nameChanged = true;
    }

    // ---------- HANDLE EMAIL ----------
    if (dto.email && dto.email !== user.email) {
      // Check if new email already exists
      const existing = await this.userModel.findOne({ email: dto.email });
      if (existing) throw new BadRequestException('Email already in use');

      const token = uuidv4();
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      await this.tokenModel.create({
        user: user._id,
        token,
        type: TokenType.EMAIL_UPDATE,
        newEmail: dto.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h expiry
      });

      await sendEmail(
        dto.email,
        'Confirm your new email',
        `
        <p>You requested to change your email. Click below to confirm this address:</p>
        <a href="${verificationUrl}" 
           style="
             display:inline-block;
             padding:10px 20px;
             font-size:16px;
             color:white;
             background-color:#2679f3;
             text-decoration:none;
             border-radius:5px;
           ">
           Confirm Email
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this change, ignore this email.</p>
        <p>After confirmation, log in next time with your new email.</p>
      `,
      );

      emailVerificationTriggered = true;
    }

    // ---------- SAVE IF NEEDED ----------
    if (nameChanged) await user.save();

    // ---------- RESPONSE LOGIC ----------
    if (!nameChanged && !emailVerificationTriggered) {
      return { message: 'No changes detected', ok: true };
    }

    if (nameChanged && emailVerificationTriggered) {
      return {
        message: 'Name updated. Verification email sent to the new address.',
        ok: true,
        user,
      };
    }

    if (nameChanged) {
      return { message: 'Name updated successfully', ok: true, user };
    }

    return {
      message: 'Verification email sent to the new address',
      ok: true,
      user,
    };
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

  //GENERATE CAPTCHA
  async generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    const operation = '+'; // For simplicity, only addition

    const answer = num1 + num2;
    const captchaId = uuidv4();

    // Save captcha in token collection
    await this.tokenModel.create({
      token: captchaId,
      type: TokenType.CAPTCHA,
      answer,
      user: null, // optional
    });

    return { captchaId, num1, num2, operation };
  }

  // Verify captcha
  async verifyCaptcha(captchaId: string, captchaAnswer: number) {
    const record = await this.tokenModel.findOne({
      token: captchaId,
      type: TokenType.CAPTCHA,
    });

    if (!record) throw new BadRequestException('Invalid or expired captcha');

    if (record.answer !== captchaAnswer) {
      throw new BadRequestException('Captcha answer is incorrect');
    }

    // Delete captcha after verification to prevent reuse
    await record.deleteOne();

    return true;
  }
}
