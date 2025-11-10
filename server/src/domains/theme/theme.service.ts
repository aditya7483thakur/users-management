import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ThemeRepository } from './interfaces/theme.repository';

@Injectable()
export class ThemeService {
  constructor(
    @Inject('THEME_REPOSITORY')
    private readonly themeRepository: ThemeRepository,
  ) {}

  // -------------------------
  // Change theme
  // -------------------------
  async changeTheme(themeId: string, theme: string) {
    const updatedTheme = await this.themeRepository.update(themeId, { theme });

    if (!updatedTheme) {
      throw new NotFoundException('Theme not found');
    }

    return {
      message: 'Theme updated successfully',
      user: { theme: updatedTheme.theme },
      ok: true,
    };
  }

  // -------------------------
  // Add custom theme
  // -------------------------
  async addCustomTheme(themeId: string, name: string, hex: string) {
    const updatedTheme = await this.themeRepository.addCustomTheme(
      themeId,
      name,
      hex,
    );

    return {
      message: 'Custom theme added successfully',
      theme: updatedTheme.theme,
      ok: true,
    };
  }

  // -------------------------
  // Delete a custom theme
  // -------------------------
  async deleteCustomTheme(themeId: string, name: string) {
    const updatedTheme = await this.themeRepository.deleteCustomTheme(
      themeId,
      name,
    );

    return {
      message: 'Custom theme deleted successfully',
      ok: true,
      theme: updatedTheme.theme,
    };
  }

  async createDefaultTheme() {
    const theme = await this.themeRepository.create({
      theme: '#ffffff',
      customThemes: [],
    });

    return theme;
  }
}
