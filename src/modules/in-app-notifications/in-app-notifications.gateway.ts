import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { NotificationDocument } from '../notifications/notifications.schema';
import { ConnectionService } from '../connections/connections.service';
import { AccessTokenService } from '../authentication/tokens/accesstoken.service';

@Injectable()
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
})
export class NotificationGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGatewayService.name);

  constructor(
    private readonly connectionService: ConnectionService,
    private readonly accessTokenService: AccessTokenService,
    // private readonly notificationsService: NotificationsService,
  ) {}

  private async extractUserId(client: Socket): Promise<string> {
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

    return payload.userId;
  }

  // Handle WebSocket connection
  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const userId = await this.extractUserId(client);
      await this.connectionService.addConnection(
        userId,
        client.id,
        'notifications',
      );
      client.join(userId); // Join room for the user

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.connectionService.removeConnection(client.id, 'notifications');
  }

  // Send notification to a specific user
  async sendNotificationToUser(
    userId: string,
    notification: NotificationDocument,
  ) {
    try {
      const activeConnections =
        await this.connectionService.getActiveConnections(
          userId,
          'notifications',
        );

      if (activeConnections.length === 0) {
        this.logger.debug(`No active connections for user ${userId}`);
        return;
      }

      for (const connection of activeConnections) {
        this.server.to(connection.socket_id).emit('notification', {
          type: 'NEW_NOTIFICATION',
          payload: {
            id: notification._id,
            title: notification.title,
            description: notification.description,
            createdAt: notification.createdAt,
            metadata: notification.metadata,
          },
        });
      }

      this.logger.debug(
        `Notification sent to user ${userId} on ${activeConnections.length} connections`,
      );
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  // // Fetch user notifications on request
  // @SubscribeMessage('getNotifications')
  // async handleGetNotifications(@ConnectedSocket() client: Socket) {
  //   try {
  //     const userId = await this.extractUserId(client);
  //     const notifications =
  //       await this.notificationsService.getUserNotifications(userId);
  //     client.emit('notifications', notifications);
  //     this.logger.log(`Notifications sent to user: ${userId}`);
  //   } catch (error) {
  //     this.logger.error(
  //       `Error fetching notifications for user: ${client.id}`,
  //       error,
  //     );
  //     client.emit('error', 'Failed to fetch notifications');
  //   }
  // }

  // // Mark notifications as read
  // @SubscribeMessage('markNotificationsAsRead')
  // async handleMarkNotificationsAsRead(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { notificationIds: string[] },
  // ) {
  //   try {
  //     const userId = await this.extractUserId(client);
  //     const { notificationIds } = data;
  //     await this.notificationsService.markMultipleAsRead(
  //       notificationIds,
  //       userId,
  //     );
  //     client.emit('notificationsRead', { success: true, notificationIds });
  //     this.logger.log(`Marked notifications as read for user: ${userId}`);
  //   } catch (error) {
  //     this.logger.error(
  //       `Error marking notifications as read: ${error.message}`,
  //       error,
  //     );
  //     client.emit('error', 'Failed to mark notifications as read');
  //   }
  // }

  // Bulk notification sending
  async sendBulkNotifications(
    userIds: string[],
    notifications: Map<string, NotificationDocument>,
  ) {
    for (const userId of userIds) {
      const notification = notifications.get(userId);
      if (notification) {
        await this.sendNotificationToUser(userId, notification);
      }
    }
  }
}
