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
import { ConnectionService } from './messaging-connection.service';
import { ListingType } from './direct-messaging.schema';

@WebSocketGateway({ cors: true })
export class DirectMessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly directMessagingService: DirectMessagingService,
    private readonly connectionService: ConnectionService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      await this.connectionService.addConnection(userId, client.id);
      console.log(`Client connected: ${client.id}, User: ${userId}`);

      // Join a room for the user's ID to allow direct messaging
      client.join(userId);

      // Send unread message count to the user
      const unreadCount =
        await this.directMessagingService.getUnreadMessageCount(userId);
      client.emit('unreadMessageCount', unreadCount);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    await this.connectionService.removeConnection(client.id);
  }

  @SubscribeMessage('createConversation')
  async handleCreateConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userIds: string[]; listingType: ListingType; listingId?: string },
  ) {
    const conversation = await this.directMessagingService.createConversation(
      data.userIds,
      data.listingType,
      data.listingId,
    );

    // Notify all participants about the new conversation
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
    const userId = client.handshake.query.userId as string;
    const message = await this.directMessagingService.sendMessage(
      data.conversationId,
      userId,
      data.content,
    );

    const conversation = await this.directMessagingService.getConversation(
      data.conversationId,
    );

    // Send the message to all participants in the conversation
    conversation.user_ids.forEach(async (participantId) => {
      if (participantId.toString() !== userId) {
        this.server.to(participantId.toString()).emit('newMessage', message);

        // Update the other client's unread count
        const unreadCount =
          await this.directMessagingService.getUnreadMessageCount(
            participantId.toString(),
          );
        this.server
          .to(participantId.toString())
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
    console.log(messages);

    client.emit('getMessagesResponse', messages);
  }

  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.handshake.query.userId as string;
    await this.directMessagingService.markMessagesAsRead(
      data.conversationId,
      userId,
    );

    // Notify the user about the updated unread count
    const unreadCount =
      await this.directMessagingService.getUnreadMessageCount(userId);
    client.emit('unreadMessageCount', unreadCount);
  }

  @SubscribeMessage('getUserConversations')
  async handleGetUserConversations(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    const conversations =
      await this.directMessagingService.getUserConversations(userId);
    client.emit('getUserConversationsResponse', conversations);
  }
}
