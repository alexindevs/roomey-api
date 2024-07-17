import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { EmailService } from '../emails/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema, UserSchema } from './authentication.schema';
import { OtpModule } from '../otp/otp.module';
import { AccessTokenService } from './tokens/accesstoken.service';
import { RefreshTokenService } from './tokens/refreshtoken.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
    OtpModule,
  ],
  providers: [AuthenticationService, AccessTokenService, RefreshTokenService, EmailService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
