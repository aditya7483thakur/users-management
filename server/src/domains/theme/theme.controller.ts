import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ChangeThemeDto } from './dto/theme-change.dto';
import { AddCustomThemeDto } from './dto/add-custom-theme.dto';
import { DeleteCustomThemeDto } from './dto/delete-custom-theme.dto';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  // Change theme
  @Patch('change')
  async changeTheme(@Request() req, @Body() dto: ChangeThemeDto) {
    try {
      const updatedTheme = await this.themeService.changeTheme(
        req.user.themeId,
        dto.theme,
      );
      return updatedTheme;
    } catch (error) {
      console.error('Error changing theme:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to change theme',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // add custom theme
  @Post('add-custom-theme')
  async addCustomTheme(@Request() req, @Body() dto: AddCustomThemeDto) {
    try {
      const newTheme = await this.themeService.addCustomTheme(
        req.user.themeId,
        dto.name,
        dto.hex,
      );
      return newTheme;
    } catch (error) {
      console.error('Error adding custom theme:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to add custom theme',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Change theme
  @Delete('delete-custom-theme')
  async deleteTheme(@Request() req, @Body() dto: DeleteCustomThemeDto) {
    try {
      const result = await this.themeService.deleteCustomTheme(
        req.user.themeId,
        dto.name,
      );
      return result;
    } catch (error) {
      console.error('Error deleting custom theme:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete custom theme',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
