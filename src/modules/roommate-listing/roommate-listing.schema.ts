import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
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

export enum Hobbies {
  Reading = 'Reading',
  Writing = 'Writing',
  Traveling = 'Traveling',
  Cooking = 'Cooking',
  Baking = 'Baking',
  Gardening = 'Gardening',
  Painting = 'Painting',
  Drawing = 'Drawing',
  Photography = 'Photography',
  Music = 'Music',
  Movies = 'Movies',
  Gaming = 'Gaming',
  Sports = 'Sports',
  Fitness = 'Fitness',
  Hiking = 'Hiking',
  Camping = 'Camping',
  Fishing = 'Fishing',
  Crafting = 'Crafting',
  Sewing = 'Sewing',
  Knitting = 'Knitting',
  DIY_Projects = 'DIY_Projects',
  Coding = 'Coding',
  Blogging = 'Blogging',
  Dancing = 'Dancing',
  Singing = 'Singing',
  Acting = 'Acting',
  Collecting = 'Collecting',
  Bird_Watching = 'Bird_Watching',
  Board_Games = 'Board_Games',
  Puzzles = 'Puzzles',
  Meditation = 'Meditation',
  Yoga = 'Yoga',
}

export enum Habits {
  Organized = 'Organized',
  Disorganized = 'Disorganized',
  Punctual = 'Punctual',
  Tardy = 'Tardy',
  Clean = 'Clean',
  Messy = 'Messy',
  Quiet = 'Quiet',
  Loud = 'Loud',
  Procrastinator = 'Procrastinator',
  Planner = 'Planner',
  Introvert = 'Introvert',
  Extrovert = 'Extrovert',
  Ambivert = 'Ambivert',
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

export enum GenderPreference {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  None = 'None',
}

export type RoommateListingDocument = HydratedDocument<RoommateListing>;

@Schema()
export class RoommateListing {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Number })
  age: number;

  @Prop({ required: true, type: [String], maxlength: 5 })
  images: string[];

  @Prop({ required: true, type: Number })
  budget: number;

  @Prop({ required: true, type: String })
  about_me: string;

  @Prop({ required: true, enum: Gender, type: String })
  gender: Gender;

  @Prop({ required: true, type: Date })
  move_in_date: Date;

  @Prop({ required: true, type: Boolean, default: true })
  is_active: boolean;

  @Prop({ required: true, type: String })
  roommate_description: string;

  @Prop({ type: [String] })
  occupation: string[];

  @Prop({ type: [String], enum: LifestyleHabits })
  lifestyle_habits: LifestyleHabits[];

  @Prop({ type: [String], enum: Hobbies })
  hobbies: Hobbies[];

  @Prop({ type: [String], enum: Habits })
  habits: Habits[];

  @Prop({ type: [String], enum: PersonalityTraits })
  personality_traits: PersonalityTraits[];

  @Prop({
    type: {
      description: String,
      preferred_gender: {
        type: String,
        enum: GenderPreference,
      },
    },
  })
  roommate_spec: {
    description: string;
    preferred_gender: GenderPreference;
  };

  @Prop({ type: Object })
  location_preference: {
    city: string;
    state: string;
    country: string;
  };

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const RoommateListingSchema =
  SchemaFactory.createForClass(RoommateListing);

export type SavedRoommatesDocument = SavedRoommates & Document;

@Schema()
export class SavedRoommates {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: string;

  @Prop({ type: Types.ObjectId, ref: 'RoommateListing' })
  roommate_id: string;
}

export const SavedRoommatesSchema =
  SchemaFactory.createForClass(SavedRoommates);
