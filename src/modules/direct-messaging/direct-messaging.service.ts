import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
  Message,
  MessageDocument,
  ListingType,
} from './direct-messaging.schema';

@Injectable()
export class DirectMessagingService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createConversation(
    userIds: string[],
    listingType: ListingType,
    listingId?: string,
  ): Promise<ConversationDocument> {
    const existingConversation = await this.conversationModel.findOne({
      user_ids: { $all: userIds.map((id) => new Types.ObjectId(id)) },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      user_ids: userIds.map((id) => new Types.ObjectId(id)),
      listing_type: listingType,
    });

    if (listingId) {
      if (listingType === ListingType.Room) {
        conversation.room_listing_id = new Types.ObjectId(listingId);
      } else {
        conversation.roommate_listing_id = new Types.ObjectId(listingId);
      }
    }

    return conversation.save();
  }

  async getConversation(
    conversationId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findById(conversationId);
  }

  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel.find({
      user_ids: new Types.ObjectId(userId),
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    const message = new this.messageModel({
      conversation_id: new Types.ObjectId(conversationId),
      sender_id: new Types.ObjectId(senderId),
      content,
    });

    await message.save();

    // Update the conversation's updated_at timestamp
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      updated_at: new Date(),
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    before?: Date,
  ): Promise<MessageDocument[]> {
    const query: any = { conversation_id: new Types.ObjectId(conversationId) };
    if (before) {
      query.sent_at = { $lt: before };
    }

    return this.messageModel
      .find(query)
      .sort({ sent_at: -1 })
      .populate('sender_id');
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        conversation_id: new Types.ObjectId(conversationId),
        sender_id: { $ne: new Types.ObjectId(userId) },
        is_read: false,
      },
      { is_read: true },
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    const conversationIds = conversations.map((conv) => conv._id);

    return this.messageModel.countDocuments({
      conversation_id: { $in: conversationIds },
      sender_id: { $ne: new Types.ObjectId(userId) },
      is_read: false,
    });
  }
}
