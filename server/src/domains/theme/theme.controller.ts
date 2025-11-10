import {
  Body,
  Controller,
  Delete,
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
    return this.themeService.changeTheme(req.user.sub, dto.theme);
  }

  // add custom theme
  @Post('add-custom-theme')
  async addCustomTheme(@Request() req, @Body() dto: AddCustomThemeDto) {
    return this.themeService.addCustomTheme(req.user.sub, dto.name, dto.hex);
  }

  // Change theme
  @Delete('delete-custom-theme')
  async deleteTheme(@Request() req, @Body() dto: DeleteCustomThemeDto) {
    return this.themeService.deleteCustomTheme(req.user.sub, dto.name);
  }
}
