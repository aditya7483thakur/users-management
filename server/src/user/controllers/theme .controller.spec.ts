import { Test, TestingModule } from '@nestjs/testing';
import { ThemeController } from './theme.controller';
import { UserService } from '../user.service';
import { ChangeThemeDto } from '../dto/theme-change.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Theme } from 'src/enums/auth.enums';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('mocked-uuid') }));

describe('ThemeController', () => {
  let controller: ThemeController;
  let service: UserService;

  const mockUserService = {
    changeTheme: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      // Override JwtAuthGuard to allow requests in tests
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<ThemeController>(ThemeController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('changeTheme', () => {
    it('should call userService.changeTheme and return result', async () => {
      const dto: ChangeThemeDto = { theme: Theme.DARK };
      const req = { user: { sub: 'user123' } };

      const mockedUser = {
        theme: Theme.DARK,
        name: 'aditya',
      };

      const result = {
        message: 'Theme updated successfully',
        user: mockedUser,
        ok: true,
      };

      jest.spyOn(service, 'changeTheme').mockResolvedValue(result);

      expect(await controller.changeTheme(req, dto)).toEqual(result);
      expect(service.changeTheme).toHaveBeenCalledWith(req.user.sub, dto.theme);
    });
  });
});
