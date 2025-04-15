import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { UserProfile, UserProfileSchema } from './profiles.schema'; // Adjust path to your JWT strategy file
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema } from '../authentication/authentication.schema';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  providers: [AccessTokenService, ProfilesService, CloudinaryConfig], // Register the ProfilesService and JwtStrategy for DI
  controllers: [ProfilesController], // Register the ProfilesController
})
export class ProfilesModule {}
