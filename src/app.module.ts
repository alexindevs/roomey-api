import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomListingModule } from './modules/room-listing/room-listing.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SavedListingsModule } from './modules/saved-listings/saved-listings.module';
import { RoommateListingModule } from './modules/roommate-listing/roommate-listing.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { DirectMessagingModule } from './modules/direct-messaging/direct-messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { NotificationGatewayService } from './modules/in-app-notifications/in-app-notifications.gateway';
import { ConnectionModule } from './modules/connections/connections.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src/templates/public'),
      serveRoot: '/templates/public',
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: 'Alexin <alexindevs@gmail.com>', // Default 'from' email address
      },
      template: {
        dir: join(__dirname, '../src/templates'), // Directory where HBS files will be stored
        adapter: new HandlebarsAdapter(), // Use Handlebars template engine
        options: {
          strict: true,
        },
      },
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/roomey-dev'),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'generallyupset',
      },
    }),
    AuthenticationModule,
    RoomListingModule,
    SavedListingsModule,
    RoommateListingModule,
    ProfilesModule,
    DirectMessagingModule,
    NotificationsModule,
    PushNotificationsModule,
    ConnectionModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationGatewayService],
})
export class AppModule {}
