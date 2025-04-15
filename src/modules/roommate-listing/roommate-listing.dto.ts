import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Gender,
  LifestyleHabits,
  Hobbies,
  Habits,
  PersonalityTraits,
  GenderPreference,
} from './roommate-listing.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRoommateListingDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @IsNotEmpty()
  @IsString()
  about_me: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsDateString()
  move_in_date: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsNotEmpty()
  @IsString()
  roommate_description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occupation?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(LifestyleHabits, { each: true })
  lifestyle_habits?: LifestyleHabits[];

  @IsOptional()
  @IsArray()
  @IsEnum(Hobbies, { each: true })
  hobbies?: Hobbies[];

  @IsOptional()
  @IsArray()
  @IsEnum(Habits, { each: true })
  habits?: Habits[];

  @IsOptional()
  @IsArray()
  @IsEnum(PersonalityTraits, { each: true })
  personality_traits?: PersonalityTraits[];

  @IsOptional()
  roommate_spec?: {
    description: string;
    preferred_gender: GenderPreference;
  };

  @IsOptional()
  location_preference?: {
    city: string;
    state: string;
    country: string;
  };
}

export class UpdateRoommateListingDto extends PartialType(
  CreateRoommateListingDto,
) {}
