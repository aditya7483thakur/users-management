import { IsEnum } from 'class-validator';
import { Theme } from '../schemas/user.schema';

export class ChangeThemeDto {
  @IsEnum(Theme, { message: 'Invalid theme selected' })
  theme: Theme;
}
