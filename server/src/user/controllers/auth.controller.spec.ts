import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('mocked-uuid') }));

describe('AuthController', () => {
  let controller: AuthController;
  let service: UserService;

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    generateCaptcha: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      // Mock guard so it doesn't block tests
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: RegisterDto = {
        name: 'Alice',
        email: 'alice@example.com',
        captchaId: '123',
        captchaAnswer: 456,
      };

      const result = {
        message: 'User registered successfully',
        token: 'abc',
        ok: true,
      };
      jest.spyOn(service, 'register').mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(service.register).toHaveBeenCalledWith(
        dto.name,
        dto.email,
        dto.captchaId,
        dto.captchaAnswer,
      );
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto: LoginDto = {
        email: 'alice@example.com',
        password: 'password123',
        captchaId: '123',
        captchaAnswer: 456,
      };

      const result = {
        message: 'Login successful',
        token: 'jwt-token',
        ok: true,
      };
      jest.spyOn(service, 'login').mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(service.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.captchaId,
        dto.captchaAnswer,
      );
    });
  });

  describe('getCaptcha', () => {
    it('should call authService.generateCaptcha and return result', async () => {
      const result = { captchaId: '123', svg: '<svg>captcha</svg>' };
      jest.spyOn(service, 'generateCaptcha').mockResolvedValue(result);

      expect(await controller.getCaptcha({})).toEqual(result);
      expect(service.generateCaptcha).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return result', async () => {
      const req = { user: { sub: 'userId', jti: 'token123' } };
      const result = { message: 'Logged out successfully', ok: true };
      jest.spyOn(service, 'logout').mockResolvedValue(result);

      expect(await controller.logout(req)).toEqual(result);
      expect(service.logout).toHaveBeenCalledWith(req.user.sub, req.user.jti);
    });
  });
});
