import { JwtAuthGuard } from './../authentication/guards/jwt-auth.guard';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common'; // Updated import
import { NotificationDocument } from '../notifications/notifications.schema';
import { ConnectionService } from '../connections/connections.service';

@Injectable()
@UseGuards(JwtAuthGuard)
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*', // Update this according to your CORS requirements
  },
})
export class NotificationGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGatewayService.name);

  constructor(private readonly connectionService: ConnectionService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = client['user']; // Access the user object attached by JwtAuthGuard
      if (!user || !user.userId) {
        this.logger.error('No authenticated user found');
        client.disconnect();
        return;
      }

      await this.connectionService.addConnection(
        user.userId,
        client.id,
        'notifications',
      );

      this.logger.log(
        `Client connected: ${client.id} for user: ${user.userId}`,
      );
    } catch (error) {
      this.logger.error('Error handling connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      await this.connectionService.removeConnection(client.id, 'notifications');
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error('Error handling disconnection:', error);
    }
  }

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
