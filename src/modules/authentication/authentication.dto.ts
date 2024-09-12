import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  Length,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Roles, Gender, NotificationFrequency } from './authentication.schema'; // Import enums

export class NewUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 24)
  password: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsEnum(Roles)
  @IsOptional() // Default is 'User', so this can be optional in the DTO
  role?: Roles;

  @IsOptional()
  @IsEnum(NotificationFrequency)
  notification_frequency?: NotificationFrequency;
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
