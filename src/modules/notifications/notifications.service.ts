import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationActions,
} from './notifications.schema';
import { EmailService } from '../emails/email.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { NotificationGatewayService } from '../in-app-notifications/in-app-notifications.gateway';
import { User, UserDocument } from '../authentication/authentication.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly pushNotificationService: PushNotificationsService,
    private readonly notificationGatewayService: NotificationGatewayService,
  ) {}

  // Notify a single user
  async sendAppNotification(
    userId: string,
    title: string,
    description: string,
    type: NotificationType[],
    purpose: NotificationActions,
  ) {
    try {
      // Create notification in database
      const notification = new this.notificationModel({
        userId,
        title,
        description,
        type,
        purpose,
        isRead: false,
      });
      await notification.save();

      console.log('Notification created:', notification);
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new NotFoundException('User not found for notification');
      }

      // Handle sending based on the notification type
      if (type.includes(NotificationType.EMAIL)) {
        await this.emailService.sendEmail(user.email, title, description);
        console.log(`Email notification sent to ${userId}`);
      }
      if (type.includes(NotificationType.PUSH)) {
        if (!user.push_token) {
          console.error('Push token not found for user');
        } else {
          await this.pushNotificationService.sendPushNotification(
            user.push_token,
            title,
            description,
          );
          console.log(`Push notification sent to ${userId}`);
        }
      }
      if (type.includes(NotificationType.IN_APP)) {
        await this.notificationGatewayService.sendNotificationToUser(
          userId,
          notification,
        );
        console.log(`In-app notification sent to ${userId}`);
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async getPendingNotifications(userId: string) {
    return await this.notificationModel
      .find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Notify multiple users in bulk
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    description: string,
    type: NotificationType[],
    purpose: NotificationActions,
  ) {
    const notifications = [];
    for (const userId of userIds) {
      const notification = new this.notificationModel({
        userId,
        title,
        description,
        type,
        purpose,
        isRead: false,
      });
      await notification.save();
      notifications.push(notification);

      // Handle each type of notification
      if (type.includes(NotificationType.EMAIL)) {
        await this.emailService.sendEmail(userId, title, description);
      }
      if (type.includes(NotificationType.PUSH)) {
        await this.pushNotificationService.sendPushNotification(
          userId,
          title,
          description,
        );
      }
      if (type.includes(NotificationType.IN_APP)) {
        await this.notificationGatewayService.sendNotificationToUser(
          userId,
          notification,
        );
      }
    }

    return notifications;
  }

  // Fetch notifications for a user
  async getUserNotifications(userId: string) {
    return await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Mark a notification as read
  async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();
    return notification;
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[], userId: string) {
    await this.notificationModel.updateMany(
      { _id: { $in: notificationIds }, userId },
      { isRead: true, updatedAt: new Date() },
    );
    return { success: true, notificationIds };
  }
}
