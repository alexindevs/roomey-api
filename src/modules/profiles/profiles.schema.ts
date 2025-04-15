import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Location } from '../room-listing/room-listing.schema';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum PersonalityTraits {
  Friendly = 'Friendly',
  Reserved = 'Reserved',
  Outgoing = 'Outgoing',
  Shy = 'Shy',
  Optimistic = 'Optimistic',
  Pessimistic = 'Pessimistic',
  Independent = 'Independent',
  Dependent = 'Dependent',
  Adventurous = 'Adventurous',
  Cautious = 'Cautious',
  Creative = 'Creative',
  Analytical = 'Analytical',
  Empathetic = 'Empathetic',
  Rational = 'Rational',
  Honest = 'Honest',
  Dishonest = 'Dishonest',
  Humorous = 'Humorous',
  Serious = 'Serious',
  Confident = 'Confident',
  Insecure = 'Insecure',
  Loyal = 'Loyal',
  Disloyal = 'Disloyal',
  Patient = 'Patient',
  Impatient = 'Impatient',
  Generous = 'Generous',
  Stingy = 'Stingy',
}

export enum LifestyleHabits {
  Early_Bird = 'Early_Bird',
  Night_Owl = 'Night_Owl',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  Non_Vegetarian = 'Non_Vegetarian',
  Fitness_Enthusiast = 'Fitness_Enthusiast',
  Smoker = 'Smoker',
  Non_Smoker = 'Non_Smoker',
  Drinker = 'Drinker',
  Non_Drinker = 'Non_Drinker',
  Pet_Lover = 'Pet_Lover',
  No_Pets = 'No_Pets',
  Social_Butterfly = 'Social_Butterfly',
  Homebody = 'Homebody',
}

export enum ChildrenOptions {
  Children = 'Children',
  No_Children = 'No_Children',
}

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema()
export class UserProfile {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  age: number;

  @Prop({ required: true, enum: Gender, type: String })
  gender: Gender;

  @Prop({ type: String })
  profile_picture: string;

  @Prop({ required: true, type: String })
  about_me: string;

  @Prop({
    required: true,
    type: [
      {
        city: String,
        state: String,
      },
    ],
  })
  preferred_locations: {
    city: string;
    state: string;
  }[];

  @Prop({ type: [String], enum: PersonalityTraits })
  personality_traits: PersonalityTraits[];

  @Prop({
    required: true,
    type: {
      currency: String,
      amount: Number,
    },
  })
  budget: {
    currency: string;
    amount: number;
  };

  @Prop({ required: true, type: Location })
  location: Location;

  @Prop({ required: true, type: Date })
  preferred_move_in_date: Date;

  @Prop({ type: [String] })
  occupation: string[];

  @Prop({ type: String })
  school: string;

  @Prop({ type: String, enum: ChildrenOptions })
  children: string;

  @Prop({ type: String })
  race: string;

  @Prop({ type: [String], enum: LifestyleHabits })
  interests: LifestyleHabits[];

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
