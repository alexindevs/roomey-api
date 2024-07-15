import { Otp, OtpSchema } from './otp.schema';
import { OtpService } from './otp.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
  providers: [OtpService],
})
export class OtpModule {}
