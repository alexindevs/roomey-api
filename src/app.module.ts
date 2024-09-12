import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomListingModule } from './modules/room-listing/room-listing.module';
import { SavedListingsModule } from './modules/saved-listings/saved-listings.module';
import { RoommateListingModule } from './modules/roommate-listing/roommate-listing.module';
import { ProfilesService } from './modules/profiles/profiles.service';
import { ProfilesController } from './modules/profiles/profiles.controller';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { AccessTokenService } from './modules/authentication/tokens/accesstoken.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/roomey-dev'),
    AuthenticationModule,
    RoomListingModule,
    SavedListingsModule,
    RoommateListingModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
