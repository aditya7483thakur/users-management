import { IsString, MinLength } from 'class-validator';

export class changePasswordDto {
  @IsString({ message: 'Old Password is required' })
  oldPassword: string;

  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;

  @IsString({ message: 'Confirm password is required' })
  confirmPassword: string;
}
