import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString({ message: 'Captcha ID must be a string' })
  @IsNotEmpty({ message: 'Captcha ID is required' })
  captchaId: string;

  @IsNumber({}, { message: 'Captcha answer must be a number' })
  captchaAnswer: number;
}
