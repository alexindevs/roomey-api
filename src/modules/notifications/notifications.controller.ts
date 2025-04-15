import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service'; // Ensure NotificationsService is correctly imported

@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // Fetch user notifications
  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(@Req() req: any) {
    try {
      const userId = req.user['userId']; // Extract the userId from the request after JwtAuthGuard has validated the token
      const notifications =
        await this.notificationsService.getUserNotifications(userId);
      this.logger.log(`Notifications sent to user: ${userId}`);
      return notifications;
    } catch (error) {
      this.logger.error(
        `Error fetching notifications for user: ${req.user['userId']}`,
        error.message,
      );
      throw new HttpException(
        'Failed to fetch notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Mark notifications as read
  @UseGuards(JwtAuthGuard)
  @Put('read')
  async markNotificationsAsRead(
    @Req() req: any,
    @Body() body: { notificationIds: string[] },
  ) {
    try {
      const userId = req.user['userId']; // Extract the userId from the request after JwtAuthGuard has validated the token
      const { notificationIds } = body;

      await this.notificationsService.markMultipleAsRead(
        notificationIds,
        userId,
      );

      this.logger.log(`Marked notifications as read for user: ${userId}`);
      return { success: true, notificationIds };
    } catch (error) {
      this.logger.error(
        `Error marking notifications as read: ${error.message}`,
      );
      throw new HttpException(
        'Failed to mark notifications as read',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
