import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { User } from '../schemas/user.schema';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('mocked-uuid') }));

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    forgotPassword: jest.fn(),
    setPassword: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    verifyEmailUpdate: jest.fn(),
    changePassword: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
    generateCaptcha: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      // Mock guard so tests don't require real JWT
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should call userService.forgotPassword and return result', async () => {
      const email = 'alice@test.com';
      const result = { message: 'Password reset email sent', ok: true };
      jest.spyOn(service, 'forgotPassword').mockResolvedValue(result);

      expect(await controller.forgotPassword({ email })).toEqual(result);
      expect(service.forgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('setPassword', () => {
    it('should call userService.setPassword and return result', async () => {
      const token = 'token123';
      const dto = { password: 'newpass', confirmPassword: 'newpass' };
      const result = { message: 'Password set successfully', ok: true };
      jest.spyOn(service, 'setPassword').mockResolvedValue(result);

      expect(await controller.setPassword(token, dto)).toEqual(result);
      expect(service.setPassword).toHaveBeenCalledWith(
        token,
        dto.password,
        dto.confirmPassword,
      );
    });
  });

  describe('getProfile', () => {
    it('should call userService.getUser and return result', async () => {
      const req = { user: { sub: 'userId' } };

      // realistic user object as returned by getUser
      const result = {
        _id: 'abc123',
        name: 'Alice',
        email: 'alice@test.com',
        isVerified: true,
        theme: 'light',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      } as Omit<User, 'passwordHash' | 'jwt'>;
      jest.spyOn(service, 'getUser').mockResolvedValue(result);

      expect(await controller.getProfile(req)).toEqual(result);
      expect(service.getUser).toHaveBeenCalledWith(req.user.sub);
    });
  });

  describe('updateProfile', () => {
    it('should update only the name', async () => {
      const req = { user: { sub: 'userId' } };
      const dto = { name: 'Bob' };
      const result = { message: 'Name updated successfully', ok: true };

      jest.spyOn(service, 'updateUser').mockResolvedValue(result);

      expect(await controller.updateProfile(req, dto)).toEqual(result);
      expect(service.updateUser).toHaveBeenCalledWith(req.user.sub, dto);
    });

    it('should update only the email', async () => {
      const req = { user: { sub: 'userId' } };
      const dto = { email: 'newemail@example.com' };
      const result = {
        message: 'Verification email sent to the new address',
        ok: true,
      };

      jest.spyOn(service, 'updateUser').mockResolvedValue(result);

      expect(await controller.updateProfile(req, dto)).toEqual(result);
      expect(service.updateUser).toHaveBeenCalledWith(req.user.sub, dto);
    });

    it('should update both name and email', async () => {
      const req = { user: { sub: 'userId' } };
      const dto = { name: 'Bob', email: 'newemail@example.com' };
      const result = {
        message: 'Name updated. Verification email sent to the new address.',
        ok: true,
      };

      jest.spyOn(service, 'updateUser').mockResolvedValue(result);

      expect(await controller.updateProfile(req, dto)).toEqual(result);
      expect(service.updateUser).toHaveBeenCalledWith(req.user.sub, dto);
    });
  });

  describe('verifyEmail', () => {
    it('should call userService.verifyEmailUpdate and return result', async () => {
      const token = 'token123';
      const result = { message: 'Email verified', ok: true };
      jest.spyOn(service, 'verifyEmailUpdate').mockResolvedValue(result);

      expect(await controller.verifyEmail(token)).toEqual(result);
      expect(service.verifyEmailUpdate).toHaveBeenCalledWith(token);
    });
  });

  describe('changePassword', () => {
    it('should call userService.changePassword and return result', async () => {
      const req = { user: { sub: 'userId', jti: 'token123' } };
      const dto = {
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      };
      const result = { message: 'Password changed', ok: true };
      jest.spyOn(service, 'changePassword').mockResolvedValue(result);

      expect(await controller.changePassword(req, dto)).toEqual(result);
      expect(service.changePassword).toHaveBeenCalledWith(
        req.user.sub,
        dto.oldPassword,
        dto.newPassword,
        dto.confirmPassword,
        req.user.jti,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should call userService.getAllUsers and return result', async () => {
      const limit = 10;
      const cursor = 'abc';

      const result = {
        ok: true,
        data: [
          {
            _id: '68f0ae2769be369e58c95db4',
            name: 'Rahul',
            email: 'rahul123@gmail.com',
            isVerified: true,
            theme: 'dark',
          },
        ],
        message: 'Users fetched successfully',
        nextCursor: 'next123',
      } as Awaited<ReturnType<typeof service.getAllUsers>>;

      jest.spyOn(service, 'getAllUsers').mockResolvedValue(result);

      expect(await controller.getAllUsers(limit, cursor)).toEqual(result);
      expect(service.getAllUsers).toHaveBeenCalledWith(limit, cursor);
    });
  });

  describe('deleteMe', () => {
    it('should call userService.deleteUser and return result', async () => {
      const req = { user: { sub: 'userId' } };
      const result = { message: 'Deleted', ok: true };
      jest.spyOn(service, 'deleteUser').mockResolvedValue(result);

      expect(await controller.deleteMe(req)).toEqual(result);
      expect(service.deleteUser).toHaveBeenCalledWith(req.user.sub);
    });
  });

  describe('deleteUser', () => {
    it('should call userService.deleteUser and return result', async () => {
      const id = 'userId';
      const result = { message: 'Deleted', ok: true };
      jest.spyOn(service, 'deleteUser').mockResolvedValue(result);

      expect(await controller.deleteUser(id)).toEqual(result);
      expect(service.deleteUser).toHaveBeenCalledWith(id);
    });
  });

  describe('getCaptcha', () => {
    it('should call userService.generateCaptcha and return result', async () => {
      const result = { captchaId: '123', svg: '<svg></svg>' };
      jest.spyOn(service, 'generateCaptcha').mockResolvedValue(result);

      expect(await controller.getCaptcha()).toEqual(result);
      expect(service.generateCaptcha).toHaveBeenCalled();
    });
  });
});
