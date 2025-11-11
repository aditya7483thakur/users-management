import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { sendEmail } from 'src/utils/sendEmail';
import { TokenType } from 'src/enums/auth.enums';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';
import type { UserRepository } from './interfaces/user.repository';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  // -------------------------
  // Get user profile
  // -------------------------
  async getUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Remove sensitive fields
    const { passwordHash, jwt, ...safeUser } = user;
    return safeUser;
  }

  // -------------------------
  // Update user profile
  // -------------------------
  async updateUser(userId: string, dto: UpdateUserDto) {
    if (!dto.name && !dto.email) {
      return { message: 'No changes detected', ok: true };
    }

    // Fetch user
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let nameChanged = false;
    let emailVerificationTriggered = false;

    // ----------------------------
    // HANDLE NAME UPDATE
    // ----------------------------
    if (dto.name && dto.name !== user.name) {
      await this.userRepository.update(userId, { name: dto.name });
      nameChanged = true;
    }

    // ----------------------------
    // HANDLE EMAIL UPDATE
    // ----------------------------
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('Email already in use');

      const token = uuidv4();
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      // Store verification token
      await this.tokenService.createToken({
        user: userId,
        token,
        type: TokenType.EMAIL_UPDATE,
        newEmail: dto.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Send verification email
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

    // ----------------------------
    // RESPONSE LOGIC
    // ----------------------------
    if (!nameChanged && !emailVerificationTriggered) {
      return { message: 'No changes detected', ok: true };
    }

    if (nameChanged && emailVerificationTriggered) {
      return {
        message: 'Name updated. Verification email sent to the new address.',
        ok: true,
        user: { ...user, name: dto.name },
      };
    }

    if (nameChanged) {
      return {
        message: 'Name updated successfully',
        ok: true,
        user: { ...user, name: dto.name },
      };
    }

    return {
      message: 'Verification email sent to the new address',
      ok: true,
      user,
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async create(data: Partial<User>) {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<User>) {
    return this.userRepository.update(id, data);
  }
  // -------------------------
  // Email verification for the updation of email
  // -------------------------
  async verifyEmailUpdate(token: string) {
    // 1️⃣ Find the token record for EMAIL_UPDATE
    const record = (await this.tokenService.findValidToken(token, [
      TokenType.EMAIL_UPDATE,
    ])) as any;

    if (!record) {
      throw new BadRequestException('Invalid or expired token');
    }

    // 2️⃣ Fetch the associated user
    const user = await this.userRepository.findById(record.user.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3️⃣ Extract new email from token data
    const newEmail = record.newEmail;
    if (!newEmail) {
      throw new BadRequestException('Token does not contain a valid new email');
    }

    // 4️⃣ Ensure no other user already has that email
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 5️⃣ Update the user's email
    await this.userRepository.update(record.user.toString(), {
      email: newEmail,
    });

    // 6️⃣ Delete the used token
    await this.tokenService.deleteToken(record._id.toString());

    return { message: 'Email updated successfully', ok: true };
  }

  // -------------------------
  // Get all users
  // -------------------------
  async getAllUsers(limit = 10, cursor?: string) {
    const chance = Math.random();

    // Construct the query filter based on cursor pagination
    const filter: Record<string, any> = {};
    if (cursor) {
      filter._id = { $gt: cursor }; // your repository should internally handle ObjectId conversion
    }

    let users: User[] = [];

    // Simulate "chance" skipping, as in your original implementation
    if (chance >= 0.5) {
      users = await this.userRepository.findAllWithPagination(
        filter,
        limit + 1,
      );
    }

    // Determine nextCursor if there's more data
    let nextCursor: string | undefined = undefined;
    if (users.length > limit) {
      const nextUser = users.pop() as any;
      nextCursor = nextUser?._id?.toString();
    }

    // Remove sensitive fields from every user
    const sanitizedUsers = users.map(
      ({ passwordHash, jwt, ...safeUser }) => safeUser,
    );

    // Simulate "data missing" logic for testing
    const dataToSend =
      sanitizedUsers.length > 0 ? sanitizedUsers : chance < 0.5 ? null : [];

    return {
      ok: true,
      data: dataToSend,
      message:
        sanitizedUsers.length > 0
          ? 'Users fetched successfully'
          : 'No users found',
      nextCursor,
    };
  }

  // -------------------------
  // Delete user
  // -------------------------
  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(userId);
    return { message: 'User deleted successfully', ok: true };
  }
}
