import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddCustomThemeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^(?!\b(dark|light|red)\b$).*/i, {
    message: 'Theme name cannot be "dark", "light", or "red".',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, {
    message: 'Invalid hex color format. Use format like #2679f3',
  })
  hex: string;
}
