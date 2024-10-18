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
import { NotificationsQueue } from '../notifications/notifications.queue';
import {
  NotificationActions,
  NotificationType,
} from '../notifications/notifications.schema';

@Injectable()
export class DirectMessagingService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    private notificationsQueue: NotificationsQueue,
  ) {}

  async createConversation(
    userIds: string[],
    listingType: ListingType,
    listingId?: string,
  ): Promise<ConversationDocument> {
    const existingConversation = await this.conversationModel.findOne({
      users: { $all: userIds.map((id) => new Types.ObjectId(id)) },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      users: userIds.map((id) => new Types.ObjectId(id)),
      listing_type: listingType,
    });

    if (listingId) {
      if (listingType === ListingType.Room) {
        conversation.room_listing = new Types.ObjectId(listingId);
      } else {
        conversation.roommate_listing = new Types.ObjectId(listingId);
      }
    }

    return conversation.save();
  }

  async getConversation(
    conversationId: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findById(conversationId)
      .populate('users', '-password') // Populate users array, excluding sensitive data like password
      .populate({
        path: 'room_listing',
        model: 'RoomListing',
      })
      .populate({
        path: 'roommate_listing',
        model: 'RoommateListing',
      });
  }

  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ConversationDocument[]> {
    const skip = (page - 1) * limit;
    return this.conversationModel
      .aggregate([
        {
          $match: {
            users: new Types.ObjectId(userId), // Match conversations involving the user
          },
        },
        {
          // Lookup the latest message in the conversation
          $lookup: {
            from: 'messages', // Name of the message collection
            localField: '_id', // Field in the conversation collection
            foreignField: 'conversation', // Field in the message collection
            as: 'messages', // Output array of messages
          },
        },
        {
          // Sort the messages in each conversation by sent_at descending to get the latest message
          $addFields: {
            latestMessage: {
              $arrayElemAt: [
                { $sortArray: { input: '$messages', sortBy: { sent_at: -1 } } },
                0,
              ],
            },
          },
        },
        {
          // Sort conversations by the latest message's sent_at field
          $sort: { 'latestMessage.sent_at': -1 },
        },
        {
          // Skip and limit for pagination
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          // Project the required fields (you can add/remove fields as needed)
          $project: {
            _id: 1,
            users: 1,
            room_listing: 1,
            roommate_listing: 1,
            listing_type: 1,
            created_at: 1,
            updated_at: 1,
            latestMessage: 1, // Include the latest message in the output
          },
        },
      ])
      .exec();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<MessageDocument> {
    const message = new this.messageModel({
      conversation: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      content,
    });

    await message.save();

    // Update the conversation's updated_at timestamp
    const conversation = await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        updated_at: new Date(),
      },
      { new: true },
    );

    const receiver_id = conversation.users.find(
      (id) => id.toString() !== senderId,
    );

    const formattedMessage =
      'Someone sent you a new message on Roomey. Check it out: ' +
      (content.length <= 150
        ? content
        : content.slice(0, content.slice(0, 150).lastIndexOf(' ')) + '...');

    if (receiver_id) {
      this.notificationsQueue.addNotificationJob(
        String(receiver_id),
        'You have a new message!',
        formattedMessage,
        [
          NotificationType.EMAIL,
          NotificationType.PUSH,
          NotificationType.IN_APP,
        ],
        NotificationActions.NEW_MESSAGE,
        message,
      );
    }

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
      .populate('sender');
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        conversation: new Types.ObjectId(conversationId),
        sender: { $ne: new Types.ObjectId(userId) },
        is_read: false,
      },
      { is_read: true },
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    const conversationIds = conversations.map((conv) => conv._id);

    return this.messageModel.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: new Types.ObjectId(userId) },
      is_read: false,
    });
  }
}
