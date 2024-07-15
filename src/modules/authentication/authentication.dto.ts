import { IsString, IsEmail, IsNotEmpty, IsDate, Length } from 'class-validator';

export class NewUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDate()
  @IsNotEmpty()
  date_of_birth: Date;

  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  password: string;
}

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StartPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class EndPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  newPassword: string;
}

export class ResendOTPForVerifDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
