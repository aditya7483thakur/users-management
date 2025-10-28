import { IsString, Matches } from 'class-validator';

export class ChangeThemeDto {
  @IsString()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, {
    message: 'Theme must be a valid hex color code (e.g., #AABBCC)',
  })
  theme: string;
}
