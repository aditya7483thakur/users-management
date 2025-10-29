import { Test, TestingModule } from '@nestjs/testing';
import { ThemeController } from './theme.controller';
import { UserService } from '../user.service';
import { ChangeThemeDto } from '../dto/theme-change.dto';
import { AddCustomThemeDto } from '../dto/add-custom-theme.dto';
import { DeleteCustomThemeDto } from '../dto/delete-custom-theme.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Theme } from 'src/enums/auth.enums';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('mocked-uuid') }));

describe('ThemeController', () => {
  let controller: ThemeController;
  let service: UserService;

  const mockUserService = {
    changeTheme: jest.fn(),
    addCustomTheme: jest.fn(),
    deleteCustomTheme: jest.fn(),
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
      // Override JwtAuthGuard to bypass authentication during tests
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

      const response = await controller.changeTheme(req, dto);

      expect(response).toEqual(result);
      expect(service.changeTheme).toHaveBeenCalledWith(req.user.sub, dto.theme);
    });
  });

  describe('addCustomTheme', () => {
    it('should call userService.addCustomTheme and return result', async () => {
      const dto: AddCustomThemeDto = { name: 'Ocean Blue', hex: '#123456' };
      const req = { user: { sub: 'user123' } };

      const result = {
        message: 'Custom theme added successfully',
        theme: '#123456',
        ok: true,
      };

      jest.spyOn(service, 'addCustomTheme').mockResolvedValue(result);

      const response = await controller.addCustomTheme(req, dto);

      expect(response).toEqual(result);
      expect(service.addCustomTheme).toHaveBeenCalledWith(
        req.user.sub,
        dto.name,
        dto.hex,
      );
    });
  });

  describe('deleteTheme', () => {
    it('should call userService.deleteCustomTheme and return result', async () => {
      const dto: DeleteCustomThemeDto = { name: 'Ocean Blue' };
      const req = { user: { sub: 'user123' } };

      const result = {
        message: 'Custom theme deleted successfully',
        ok: true,
        theme: '#ffffff',
      };

      jest.spyOn(service, 'deleteCustomTheme').mockResolvedValue(result);

      const response = await controller.deleteTheme(req, dto);

      expect(response).toEqual(result);
      expect(service.deleteCustomTheme).toHaveBeenCalledWith(
        req.user.sub,
        dto.name,
      );
    });
  });
});
