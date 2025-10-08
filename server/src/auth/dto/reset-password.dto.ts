import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token is required' })
  token: string;

  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString({ message: 'Confirm password is required' })
  confirmPassword: string;
}
