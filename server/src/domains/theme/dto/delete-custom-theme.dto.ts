import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCustomThemeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
