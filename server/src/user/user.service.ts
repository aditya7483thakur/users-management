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
import svgCaptcha from 'svg-captcha';
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
  // Register user & send verification email
  // -------------------------
  async register(
    name: string,
    email: string,
    captchaId: string,
    captchaAnswer: number,
  ) {
    await this.verifyCaptcha(captchaId, captchaAnswer);
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
  // Login
  // -------------------------
  async login(
    email: string,
    password: string,
    captchaId: string,
    captchaAnswer: number,
  ) {
    await this.verifyCaptcha(captchaId, captchaAnswer);
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

  // -------------------------
  // Logout
  // -------------------------
  async logout(userId: string, currentToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    // Remove the current token from the jwt array
    user.jwt = user.jwt.filter((token) => token !== currentToken);

    await user.save();

    return { message: 'Logged out successfully', ok: true };
  }

  // -------------------------
  // Forgot password → send reset email
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

    return { message: 'Password reset email sent', ok: true };
  }

  // -------------------------
  // Unified setPassword → handles first-time verification & password reset
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
    if (user.passwordHash) {
      const isSameAsOld = await bcrypt.compare(
        decodedPassword,
        user.passwordHash,
      );
      if (isSameAsOld) {
        throw new BadRequestException(
          'New password cannot be the same as the old password',
        );
      }
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

  // -------------------------
  // Email verification for the updation of email
  // -------------------------
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

  // -------------------------
  // change password for logged-in users
  // -------------------------
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
  // Get user profile
  // -------------------------
  async getUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash -jwt');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -------------------------
  // Update user profile
  // -------------------------
  async updateUser(userId: string, dto: UpdateUserDto) {
    if (!dto.name && !dto.email) {
      return { message: 'No changes detected', ok: true };
    }

    const user = await this.userModel
      .findById(userId)
      .select(' -passwordHash -jwt');
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

  async getAllUsers(limit = 10, cursor?: string) {
    const chance = Math.random();
    let users: Omit<UserDocument, 'passwordHash' | 'jwt'>[] = [];

    // Convert cursor to ObjectId if exists
    const query: any = {};
    if (cursor) query._id = { $gt: cursor };

    if (chance >= 0.5) {
      users = await this.userModel
        .find(query)
        .select('-passwordHash -jwt')
        .sort({ _id: 1 })
        .limit(limit + 1); // fetch one extra to know if more exists
    }

    let nextCursor: string | null = null;
    if (users.length > limit) {
      const nextUser = users.pop(); // remove extra
      nextCursor = nextUser?._id.toString() || null;
    }

    return {
      ok: true,
      data: users.length > 0 ? users : null,
      message:
        users.length > 0 ? 'Users fetched successfully' : 'No users found',
      nextCursor,
    };
  }

  // -------------------------
  // Delete user
  // -------------------------
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully', ok: true };
  }

  // -------------------------
  // Change theme
  // -------------------------
  async changeTheme(userId: string, theme: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { theme }, { new: true })
      .select('-passwordHash -jwt');
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Theme updated successfully', user, ok: true };
  }

  // -------------------------
  // Generate Captcha
  // -------------------------
  // async generateCaptcha() {
  //   const num1 = Math.floor(Math.random() * 10) + 1; // 1–10
  //   const num2 = Math.floor(Math.random() * 10) + 1; // 1–10

  //   // Randomly select an operation
  //   const operations = ['+', '-', '*'];
  //   const operation = operations[Math.floor(Math.random() * operations.length)];

  //   // Compute the answer based on the operation
  //   let answer: number;
  //   switch (operation) {
  //     case '+':
  //       answer = num1 + num2;
  //       break;
  //     case '-':
  //       answer = num1 - num2;
  //       break;
  //     case '*':
  //       answer = num1 * num2;
  //       break;
  //     default:
  //       throw new Error('Invalid operation');
  //   }

  //   const captchaId = uuidv4();

  //   // Save captcha in token collection
  //   await this.tokenModel.create({
  //     token: captchaId,
  //     type: TokenType.CAPTCHA,
  //     answer,
  //     user: null,
  //     expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins expiry
  //   });

  //   return { captchaId, num1, num2, operation };
  // }

  async generateCaptcha() {
    // Create a math expression captcha
    const captcha = svgCaptcha.createMathExpr({
      mathMin: 1, // min number
      mathMax: 10, // max number
      mathOperator: '+-*', // allowed operators
      noise: 2, // lines to make OCR harder
      color: true, // colorful characters
      background: '#eee', // background color
      width: 120,
      height: 50,
      fontSize: 40,
    });

    const captchaId = uuidv4();

    // Save the answer in token collection
    await this.tokenModel.create({
      token: captchaId,
      type: TokenType.CAPTCHA,
      answer: captcha.text, // math result
      user: null,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    });

    return {
      captchaId,
      svg: captcha.data, // SVG image as string
    };
  }

  // -------------------------
  // Verify Captcha
  // -------------------------
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
