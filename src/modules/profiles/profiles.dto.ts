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
import { Type, Transform } from 'class-transformer';
import {
  Gender,
  LifestyleHabits,
  ChildrenOptions,
  PersonalityTraits,
} from './profiles.schema';

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
  @Transform(({ value }) => Number(value)) // Transform string to number
  @IsNumber()
  amount: number;
}

export class CreateUserProfileDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value)) // Transform string to number
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

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
