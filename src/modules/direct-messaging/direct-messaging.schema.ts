import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

export enum ListingType {
  Room = 'Room',
  Roommate = 'Roommate',
}

@Schema()
export class Conversation {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true }) // user_ids of participants
  user_ids: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'RoomListing' }) // Optional: Room listing
  room_listing_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RoommateListing' }) // Optional: Roommate listing
  roommate_listing_id?: Types.ObjectId;

  @Prop({ enum: ListingType, type: String, required: true }) // Specifies whether it's a room or roommate listing
  listing_type: ListingType;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // sender of the message
  sender_id: Types.ObjectId;

  @Prop({ type: String, required: true }) // message content
  content: string;

  @Prop({ type: Boolean, default: false }) // has the message been read
  is_read: boolean;

  @Prop({ type: Date, default: Date.now })
  sent_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessagingConnectionDocument = HydratedDocument<MessagingConnection>;

@Schema()
export class MessagingConnection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // reference to the user
  user_id: Types.ObjectId;

  @Prop({ required: true, type: String }) // unique socket ID
  socket_id: string;

  @Prop({ type: Boolean, default: true }) // whether the connection is active
  is_active: boolean;

  @Prop({ type: Date, default: Date.now }) // when the connection was created
  connected_at: Date;

  @Prop({ type: Date }) // when the user disconnected (optional, filled upon disconnection)
  disconnected_at: Date;
}

export const MessagingConnectionSchema =
  SchemaFactory.createForClass(MessagingConnection);
