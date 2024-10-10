import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Define the Notification document type
export type NotificationDocument = HydratedDocument<Notification>;

// Enum for the types of notifications
export enum NotificationType {
  EMAIL = 'Email',
  // SMS = 'SMS',
  PUSH = 'Push',
  IN_APP = 'In_App',
}

// Enum for the actions that trigger notifications
export enum NotificationActions {
  NEW_LISTING = 'New Roommate or Room Listing Created',
  PASSWORD_UPDATE = 'Password Reset',
  LISTING_INQUIRY = 'Listing Inquiry',
  LISTING_UPDATE = 'Listing Update',
  PROFILE_VERIFIED = 'Profile Verified',
  ACCOUNT_DEACTIVATED = 'Account Deactivated',
  NEW_MESSAGE = 'New Message',
  ROOMMATE_MATCH = 'Roommate Match Found',
  REVIEW_RECEIVED = 'Review Received',
  APPLICATION_STATUS = 'Roommate Application Status',
  FAVORITE_LISTING_UPDATE = 'Favorite Listings Update',
  LISTING_EXPIRATION = 'Listing Expiration',
  APPOINTMENT_REMINDER = 'Appointment Reminder',
  ROOMMATE_RECOMMENDATION = 'Roommate Recommendation',
  SECURITY_ALERT = 'Security Alert',
  PAYMENT_CONFIRMATION = 'Payment Confirmation',
  FEATURE_UPDATE = 'Feature Update',
}

@Schema()
export class Notification {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  userId: string; // Link to the user who will receive the notification

  // Update type field to allow an array of NotificationType enums
  @Prop({ type: [String], enum: NotificationType, required: true })
  type: NotificationType[]; // Allow multiple notification types

  @Prop({ enum: NotificationActions, required: true })
  purpose: NotificationActions; // The action that triggered the notification

  @Prop({ required: true, type: Boolean, default: false })
  isRead: boolean; // Whether the user has read the notification

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
