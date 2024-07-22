import { Module } from '@nestjs/common';
import { RoomListingService } from './room-listing.service';
import { RoomListingController } from './room-listing.controller';

@Module({
  providers: [RoomListingService],
  controllers: [RoomListingController],
})
export class RoomListingModule {}
