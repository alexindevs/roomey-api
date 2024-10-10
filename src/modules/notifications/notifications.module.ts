import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './notifications.schema';
import { BullModule } from '@nestjs/bull';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { NotificationGatewayService } from '../in-app-notifications/in-app-notifications.gateway';
import { EmailService } from '../emails/email.service';
import { ConnectionService } from '../connections/connections.service';
import { ConnectionSchema } from '../connections/connections.schema';
import { NotificationsQueue } from './notifications.queue'; // Ensure NotificationsQueue is imported
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema } from '../authentication/authentication.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
      { name: 'Connection', schema: ConnectionSchema },
      { name: 'User', schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [
    AccessTokenService,
    NotificationsService,
    NotificationsProcessor,
    NotificationsQueue,
    EmailService,
    PushNotificationsService,
    NotificationGatewayService,
    ConnectionService,
  ],
  exports: [
    NotificationsService,
    NotificationsQueue, // Export NotificationsQueue
  ],
})
export class NotificationsModule {}
