import { BaseRepository } from 'src/common/base.repository';
import { Theme } from '../schemas/theme.schema';

export interface ThemeRepository extends BaseRepository<Theme> {
  addCustomTheme(themeId: string, name: string, hex: string): Promise<Theme>;
  deleteCustomTheme(themeId: string, name: string): Promise<Theme>;
}
