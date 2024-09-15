import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomListingModule } from './modules/room-listing/room-listing.module';
import { SavedListingsModule } from './modules/saved-listings/saved-listings.module';
import { RoommateListingModule } from './modules/roommate-listing/roommate-listing.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { DirectMessagingModule } from './modules/direct-messaging/direct-messaging.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/roomey-dev'),
    AuthenticationModule,
    RoomListingModule,
    SavedListingsModule,
    RoommateListingModule,
    ProfilesModule,
    DirectMessagingModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
