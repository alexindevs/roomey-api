import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema()
export class Otp {
  @Prop({ required: true })
  token: string;
  @Prop({ required: true })
  expiry: Date;

  @Prop({ required: true })
  user_id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  type: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
