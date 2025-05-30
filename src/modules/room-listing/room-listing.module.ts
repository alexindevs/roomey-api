import { Module } from '@nestjs/common';
import { RoomListingService } from './room-listing.service';
import { RoomListingController } from './room-listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomListingSchema } from './room-listing.schema';
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema } from '../authentication/authentication.schema';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'RoomListing',
        schema: RoomListingSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  providers: [AccessTokenService, RoomListingService, CloudinaryConfig],
  controllers: [RoomListingController],
})
export class RoomListingModule {}
