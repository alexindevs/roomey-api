import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectMessagingGateway } from './direct-messaging.gateway';
import { DirectMessagingService } from './direct-messaging.service';
import { ConnectionService } from './messaging-connection.service';
import {
  MessagingConnection,
  MessagingConnectionSchema,
} from './direct-messaging.schema';
import { Conversation, ConversationSchema } from './direct-messaging.schema';
import { Message, MessageSchema } from './direct-messaging.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessagingConnection.name, schema: MessagingConnectionSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [
    DirectMessagingGateway,
    DirectMessagingService,
    ConnectionService,
  ],
})
export class DirectMessagingModule {}
