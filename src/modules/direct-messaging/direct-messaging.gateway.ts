import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessagingService } from './direct-messaging.service';
import { ConnectionService } from '../connections/connections.service';
import { ListingType } from './direct-messaging.schema';
import {
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  namespace: 'direct-messaging',
})
export class DirectMessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(DirectMessagingGateway.name);

  constructor(
    private readonly directMessagingService: DirectMessagingService,
    private readonly connectionService: ConnectionService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token =
        client.handshake.auth.token || (client.handshake.query.token as string);

      if (!token) {
        this.logger.warn(`No token provided for client: ${client.id}`);
        throw new UnauthorizedException('Missing authentication token');
      }

      const { isValid, payload } =
        this.accessTokenService.verifyAccessToken(token);

      if (!isValid || !payload.userId) {
        this.logger.warn(`Invalid token for client: ${client.id}`);
        throw new UnauthorizedException('Invalid token');
      }

      const userId = payload.userId;

      await this.connectionService.addConnection(
        userId,
        client.id,
        'messaging',
      );

      client.join(userId);

      const unreadCount =
        await this.directMessagingService.getUnreadMessageCount(userId);
      client.emit('unreadMessageCount', unreadCount);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.connectionService.removeConnection(client.id, 'messaging');
  }

  @SubscribeMessage('createConversation')
  async handleCreateConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      userIds: [string, string];
      listingType: ListingType;
      listingId?: string;
    },
  ) {
    const token =
      client.handshake.auth.token || (client.handshake.query.token as string);
    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid || !payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const clientId = payload.userId;
    if (!clientId || !data.userIds.includes(clientId)) {
      throw new UnauthorizedException(
        'You cannot create a conversation between other people',
      );
    }

    if (data.userIds.length < 2) {
      throw new ForbiddenException('Please select only two users.');
    }

    const conversation = await this.directMessagingService.createConversation(
      data.userIds,
      data.listingType,
      data.listingId,
    );

    data.userIds.forEach((userId) => {
      this.server.to(userId).emit('newConversation', conversation);
    });

    client.emit('createConversationResponse', conversation);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const token =
      client.handshake.auth.token || (client.handshake.query.token as string);
    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid || !payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.userId;
    const message = await this.directMessagingService.sendMessage(
      data.conversationId,
      userId,
      data.content,
    );

    const conversation = await this.directMessagingService.getConversation(
      data.conversationId,
    );

    conversation.users.forEach(async (participant) => {
      if (participant._id.toString() !== userId) {
        this.server.to(participant._id.toString()).emit('newMessage', message);

        const unreadCount =
          await this.directMessagingService.getUnreadMessageCount(
            participant._id.toString(),
          );
        this.server
          .to(participant._id.toString())
          .emit('unreadMessageCount', unreadCount);
      }
    });

    client.emit('sendMessageResponse', message);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; before?: Date },
  ) {
    const messages = await this.directMessagingService.getMessages(
      data.conversationId,
      data.before,
    );

    client.emit('getMessagesResponse', messages);
  }

  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const token =
      client.handshake.auth.token || (client.handshake.query.token as string);
    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid || !payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.userId;
    await this.directMessagingService.markMessagesAsRead(
      data.conversationId,
      userId,
    );

    const unreadCount =
      await this.directMessagingService.getUnreadMessageCount(userId);
    client.emit('unreadMessageCount', unreadCount);
  }

  @SubscribeMessage('getUserConversations')
  async handleGetUserConversations(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page?: number; limit?: number },
  ) {
    const token =
      client.handshake.auth.token || (client.handshake.query.token as string);
    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid || !payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.userId;
    const { page = 1, limit = 20 } = data;
    const conversations =
      await this.directMessagingService.getUserConversations(
        userId,
        page,
        limit,
      );

    client.emit('getUserConversationsResponse', conversations);
  }
}
