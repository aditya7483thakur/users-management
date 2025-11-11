import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import svgCaptcha from 'svg-captcha';
import { UserService } from '../user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from 'src/enums/auth.enums';
import { sendEmail } from 'src/utils/sendEmail';
import { ThemeService } from '../theme/theme.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly themeService: ThemeService,
    private readonly jwtService: JwtService,
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

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email already exists');

    const user = (await this.userService.create({
      name,
      email,
      isVerified: false,
    })) as any;

    // Generate verification token
    const token = uuidv4();
    await this.tokenService.createToken({
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
    const user = (await this.userService.findByEmail(email)) as any;
    if (!user || !user.isVerified)
      throw new UnauthorizedException('Invalid credentials');

    const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');

    const valid = await bcrypt.compare(decodedPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const jti = uuidv4();
    const jwt = this.jwtService.sign({
      sub: user._id.toString(),
      jti,
      themeId: user.themeRef.toString(),
    });
    const updatedJwtList = [...(user.jwt || []), jti];
    await this.userService.update(user._id, { jwt: updatedJwtList });
    return { message: 'Login successful!', token: jwt, ok: true };
  }

  // -------------------------
  // Logout
  // -------------------------
  async logout(userId: string, currentToken: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    // Remove the current token from the jwt array
    const updatedJwtList = user.jwt.filter((token) => token !== currentToken);

    await this.userService.update(userId, { jwt: updatedJwtList });

    return { message: 'Logged out successfully', ok: true };
  }

  // -------------------------
  // Forgot password → send reset email
  // -------------------------
  async forgotPassword(email: string) {
    const user = (await this.userService.findByEmail(email)) as any;
    if (!user) throw new NotFoundException('User not found');

    const token = uuidv4();
    await this.tokenService.createToken({
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
    const record = (await this.tokenService.findValidToken(token, [
      TokenType.EMAIL_VERIFICATION,
      TokenType.PASSWORD_RESET,
    ])) as any;
    if (!record) throw new BadRequestException('Invalid or expired token');

    // 🔹 Find the user
    const user = (await this.userService.findById(record.user)) as any;
    if (!user) throw new NotFoundException('User not found');

    // 🔹 Check if new password is same as old password
    if (
      user.passwordHash &&
      (await bcrypt.compare(decodedPassword, user.passwordHash))
    ) {
      throw new BadRequestException(
        'New password cannot be same as the old one',
      );
    }

    // 🔹 Hash and set the new password
    const hashedPassword = await bcrypt.hash(decodedPassword, 10);

    if (record.type === TokenType.EMAIL_VERIFICATION && !user.isVerified) {
      // 1️⃣ Create default theme
      const theme = (await this.themeService.createDefaultTheme()) as any;

      // 2️⃣ Update user with theme reference
      await this.userService.update(user._id, {
        passwordHash: hashedPassword,
        isVerified: true,
        jwt: [], // Logout all sessions
        themeRef: theme._id,
      });
    } else {
      // -------------------------
      // 📘 Normal password reset
      // -------------------------
      await this.userService.update(user._id, {
        passwordHash: hashedPassword,
        jwt: [], // Logout all sessions
      });
    }

    await this.tokenService.deleteToken(record._id);
    return { message: 'Password set successfully', ok: true };
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

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const isValid = await bcrypt.compare(decodedOldPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Old password is incorrect');

    // Hash and set the new password
    const newHashed = await bcrypt.hash(decodedNewPassword, 10);

    // Update user — keep only current JWT, clear others
    await this.userService.update(userId, {
      passwordHash: newHashed,
      jwt: [currentToken],
    });
    return { message: 'Password changed successfully', ok: true };
  }

  // -------------------------
  // Generate Captcha
  // -------------------------
  async generateCaptcha() {
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

    await this.tokenService.createToken({
      token: captchaId,
      type: TokenType.CAPTCHA,
      answer: Number(captcha.text), // math result
      user: null,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    });

    if (process.env.NODE_ENV == 'test') {
      return {
        captchaId,
        svg: captcha.data,
        answer: captcha.text,
      };
    }
    return {
      captchaId,
      svg: captcha.data, // SVG image as string
    };
  }

  // -------------------------
  // Verify Captcha
  // -------------------------
  async verifyCaptcha(captchaId: string, captchaAnswer: number) {
    const record = (await this.tokenService.findValidToken(captchaId, [
      TokenType.CAPTCHA,
    ])) as any;

    if (!record) throw new BadRequestException('Invalid or expired captcha');

    if (record.answer !== captchaAnswer) {
      throw new BadRequestException('Captcha answer is incorrect');
    }
    // Delete captcha after verification to prevent reuse
    await this.tokenService.deleteToken(record._id);

    return true;
  }
}
