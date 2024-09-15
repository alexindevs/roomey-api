import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MessagingConnection,
  MessagingConnectionDocument,
} from './direct-messaging.schema';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectModel(MessagingConnection.name)
    private connectionModel: Model<MessagingConnectionDocument>,
  ) {}

  // Add a new connection when the user connects
  async addConnection(
    userId: string,
    socketId: string,
  ): Promise<MessagingConnection> {
    const connection = new this.connectionModel({
      user_id: userId,
      socket_id: socketId,
      is_active: true,
    });

    return connection.save();
  }

  // Mark the connection as inactive when the user disconnects
  async removeConnection(
    socketId: string,
  ): Promise<MessagingConnection | null> {
    return this.connectionModel.findOneAndUpdate(
      { socket_id: socketId },
      { is_active: false, disconnected_at: new Date() },
      { new: true },
    );
  }

  // Optionally, get all active connections for a user
  async getActiveConnections(userId: string): Promise<MessagingConnection[]> {
    return this.connectionModel.find({ user_id: userId, is_active: true });
  }
}
