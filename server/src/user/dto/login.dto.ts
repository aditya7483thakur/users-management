import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString({ message: 'Captcha ID must be a string' })
  @IsNotEmpty({ message: 'Captcha ID is required' })
  captchaId: string;

  @IsNumber({}, { message: 'Captcha answer must be a number' })
  captchaAnswer: number;
}
