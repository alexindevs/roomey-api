import { Module } from '@nestjs/common';
import { RoommateListingService } from './roommate-listing.service';
import { RoommateListingController } from './roommate-listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoommateListingSchema } from './roommate-listing.schema';
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema } from '../authentication/authentication.schema';
import { ProfilesModule } from '../profiles/profiles.module';
import { ProfilesService } from '../profiles/profiles.service';
import { UserProfileSchema } from '../profiles/profiles.schema';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RoommateListing', schema: RoommateListingSchema },
      { name: 'User', schema: UserSchema },
      { name: 'UserProfile', schema: UserProfileSchema },
    ]),
    ProfilesModule,
  ],
  providers: [
    AccessTokenService,
    ProfilesService,
    RoommateListingService,
    CloudinaryConfig,
  ],
  controllers: [RoommateListingController],
})
export class RoommateListingModule {}
