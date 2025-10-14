import { IsEnum } from 'class-validator';
import { Theme } from 'src/enums/auth.enums';

export class ChangeThemeDto {
  @IsEnum(Theme, { message: 'Invalid theme selected' })
  theme: Theme;
}
