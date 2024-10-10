import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectMessagingGateway } from './direct-messaging.gateway';
import { DirectMessagingService } from './direct-messaging.service';
import { Conversation, ConversationSchema } from './direct-messaging.schema';
import { Message, MessageSchema } from './direct-messaging.schema';
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';
import { UserSchema, User } from '../authentication/authentication.schema';
import { ConnectionService } from '../connections/connections.service';
import { ConnectionSchema } from '../connections/connections.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: 'Connection', schema: ConnectionSchema },
    ]),
  ],
  providers: [
    ConnectionService,
    AccessTokenService,
    DirectMessagingGateway,
    DirectMessagingService,
  ],
})
export class DirectMessagingModule {}
