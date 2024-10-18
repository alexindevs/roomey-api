import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, ConnectionDocument } from './connections.schema';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectModel(Connection.name)
    private connectionModel: Model<ConnectionDocument>,
  ) {}

  async addConnection(
    userId: string,
    socketId: string,
    namespace: string,
  ): Promise<Connection> {
    await this.connectionModel.updateMany(
      { namespace: namespace, user_id: userId },
      { is_active: false },
    );

    const existingConnection = await this.connectionModel.findOne({
      user_id: userId,
      socket_id: socketId,
      namespace: namespace,
    });

    if (existingConnection) {
      return existingConnection;
    }

    const connection = new this.connectionModel({
      user_id: userId,
      socket_id: socketId,
      namespace: namespace,
      is_active: true,
    });

    return connection.save();
  }

  // Mark the connection as inactive when the user disconnects
  async removeConnection(
    socketId: string,
    namespace: string,
  ): Promise<Connection | null> {
    return this.connectionModel.findOneAndUpdate(
      { socket_id: socketId, namespace: namespace },
      { is_active: false, disconnected_at: new Date() },
      { new: true },
    );
  }

  // Get all active connections for a user in a specific namespace
  async getActiveConnections(
    userId: string,
    namespace: string,
  ): Promise<Connection[]> {
    return this.connectionModel.find({
      user_id: userId,
      namespace: namespace,
      is_active: true,
    });
  }

  // Get all active connections across namespaces
  async getAllActiveConnections(userId: string): Promise<Connection[]> {
    return this.connectionModel.find({ user_id: userId, is_active: true });
  }
}
