import { Body, Controller, Patch, Request, UseGuards } from '@nestjs/common';
import { UserService } from '../user.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ChangeThemeDto } from '../dto/theme-change.dto';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: UserService) {}

  // Change theme
  @UseGuards(JwtAuthGuard)
  @Patch('change')
  async changeTheme(@Request() req, @Body() dto: ChangeThemeDto) {
    return this.themeService.changeTheme(req.user.sub, dto.theme);
  }
}
