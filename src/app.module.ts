import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomListingModule } from './modules/room-listing/room-listing.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/roomey-dev'),
    AuthenticationModule,
    RoomListingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
