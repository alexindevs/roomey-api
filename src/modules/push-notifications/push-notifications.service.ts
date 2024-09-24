import { Injectable } from '@nestjs/common';
import { admin } from './firebase-admin.config'; // The Firebase admin config we just created

@Injectable()
export class PushNotificationsService {
  // Method to send a push notification to a single device
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data: any = {},
  ): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Method to send push notifications to multiple devices
  async sendBulkPushNotification(
    deviceTokens: string[],
    title: string,
    body: string,
    data: any = {},
  ): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens: deviceTokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent multicast message:', response);
    } catch (error) {
      console.error('Error sending multicast message:', error);
    }
  }
}
