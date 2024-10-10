import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationType } from './notifications.schema';
import { NotificationActions } from './notifications.schema';

@Injectable()
export class NotificationsQueue {
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async addNotificationJob(
    userId: string,
    title: string,
    description: string,
    type: NotificationType[],
    purpose: NotificationActions,
  ) {
    try {
      await this.notificationsQueue.add('send_notification', {
        userId,
        title,
        description,
        type,
        purpose,
      });
      console.log('Notification Job Added');
    } catch (error) {
      console.error('Error adding notification job:', error);
    }
  }

  async addBulkNotificationJob(
    users: { userId: string; title: string; description: string }[],
    type: NotificationType,
    purpose: NotificationActions,
  ) {
    const bulkJobs = users.map((user) => ({
      name: 'send_notification',
      data: {
        userId: user.userId,
        title: user.title,
        description: user.description,
        type,
        purpose,
      },
    }));

    await this.notificationsQueue.addBulk(bulkJobs);
  }
}
