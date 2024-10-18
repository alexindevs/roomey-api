import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { NotificationType, NotificationActions } from './notifications.schema';

@Processor('notifications') // This is the name of the queue
export class NotificationsProcessor {
  constructor(private readonly notificationService: NotificationsService) {}

  // Process individual notification jobs
  @Process('send_notification')
  async handleNotificationJob(
    job: Job<{
      userId: string;
      title: string;
      description: string;
      type: [NotificationType];
      purpose: NotificationActions;
      metadata: object;
    }>,
  ) {
    console.log('Notification job being processed. Job data:', job.data);
    try {
      const { userId, title, description, type, purpose, metadata } = job.data;
      await this.notificationService.sendAppNotification(
        userId,
        title,
        description,
        type,
        purpose,
        metadata,
      );
    } catch (error) {
      console.error('Error processing notification job:', error);
    }
  }

  @Process('send_bulk_notification')
  async handleBulkNotificationJob(
    job: Job<{
      users: { userId: string; title: string; description: string }[];
      type: NotificationType;
      purpose: NotificationActions;
      metadata: object;
    }>,
  ) {
    const { users, type, purpose, metadata } = job.data;
    await this.notificationService.sendBulkNotifications(
      users.map((user) => user.userId),
      users[0].title,
      users[0].description,
      [type],
      purpose,
      metadata,
    );
  }
}
