import { BaseRepository } from 'src/infra/base.repository';
import { Theme, ThemeDocument } from '../schemas/theme.schema';

export interface ThemeRepository extends BaseRepository<ThemeDocument> {
  addCustomTheme(themeId: string, name: string, hex: string): Promise<Theme>;
  deleteCustomTheme(themeId: string, name: string): Promise<Theme>;
}
