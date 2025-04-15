import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedListingsService } from './saved-listings.service';
import { SavedListingsController } from './saved-listings.controller';
import { SavedRoomsSchema } from '../room-listing/room-listing.schema'; // Schema for SavedRooms
import { SavedRoommatesSchema } from '../roommate-listing/roommate-listing.schema'; // Schema for SavedRoommates
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema } from '../authentication/authentication.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SavedRooms', schema: SavedRoomsSchema },
      { name: 'SavedRoommates', schema: SavedRoommatesSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [AccessTokenService, SavedListingsService],
  controllers: [SavedListingsController],
})
export class SavedListingsModule {}
