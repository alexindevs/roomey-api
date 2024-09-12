import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import {
  Gender,
  LifestyleHabits,
  ChildrenOptions,
  PersonalityTraits,
} from './profiles.schema';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;
}

class BudgetDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreateUserProfileDto {
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  profile_picture: string;

  @IsNotEmpty()
  @IsString()
  about_me: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  preferred_locations: LocationDto[];

  @IsOptional()
  @IsArray()
  @IsEnum(PersonalityTraits, { each: true })
  personality_traits?: PersonalityTraits[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  preferred_move_in_date: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occupation?: string[];

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsEnum(ChildrenOptions)
  children?: ChildrenOptions;

  @IsOptional()
  @IsString()
  race?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(LifestyleHabits, { each: true })
  interests?: LifestyleHabits[];
}
