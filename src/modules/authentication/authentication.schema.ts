import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

enum Roles {
  USER = 'User',
  ADMIN = 'Admin',
}

@Schema()
export class User {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: Date })
  date_of_birth: Date;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, enum: Roles, type: String })
  role: string;

  @Prop({ required: true, default: false, type: Boolean })
  verified: boolean;

  @Prop({ required: true, default: true, type: Boolean })
  active: boolean;

  @Prop({ required: true, default: '', type: String })
  phone_number: string;

  @Prop({ required: true, default: false, type: Boolean })
  blacklisted: boolean;
}

export class RefreshToken {
  @Prop({ required: true, type: String })
  token: string;

  @Prop({ required: true, type: 'ObjectId' })
  userId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
