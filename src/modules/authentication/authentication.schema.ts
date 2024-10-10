import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Roles {
  USER = 'User',
  ADMIN = 'Admin',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum NotificationFrequency {
  Realtime = 'Realtime',
  Daily = 'Daily',
  None = 'None',
}
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class User {
  @Prop({ required: true, type: String })
  first_name: string;

  @Prop({ required: true, type: String })
  last_name: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: Date })
  date_of_birth: Date;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, enum: Roles, type: String, default: Roles.USER })
  role: string;

  @Prop({ required: true, default: false, type: Boolean })
  verified: boolean;

  @Prop({ required: true, default: true, type: Boolean })
  active: boolean;

  @Prop({ required: true, type: String, default: '' })
  phone_number: string;

  @Prop({ required: true, default: false, type: Boolean })
  blacklisted: boolean;

  @Prop({ required: true, enum: Gender, type: String })
  gender: Gender;

  @Prop({ type: String })
  profile_picture: string;

  @Prop({
    enum: NotificationFrequency,
    default: NotificationFrequency.Realtime,
  })
  notification_frequency: NotificationFrequency;

  @Prop({ type: String, default: null })
  push_token: string;

  @Prop({ type: Boolean, default: false })
  account_deactivated: boolean;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema()
export class RefreshToken {
  @Prop({ required: true, type: String })
  token: string;

  @Prop({ required: true, type: 'ObjectId' })
  userId: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
