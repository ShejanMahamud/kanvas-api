import admin from 'firebase-admin';
import { DeviceToken } from '../models/deviceToken.model';
import { NotificationPreferences } from '../models/notificationPreferences.model';
import { CustomError } from '../utils/customError';
import { isWithinQuietHours } from '../utils/timeUtils';

type NotificationPriority = 'high' | 'normal';
type AndroidPriority = 'default' | 'min' | 'max' | 'high' | 'low';

class NotificationService {
  private static instance: NotificationService;
  private initialized = false;
  private firebaseEnabled = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public initialize() {
    if (!this.initialized) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        console.warn(
          'Firebase configuration is missing. Push notifications will be disabled.',
        );
        this.firebaseEnabled = false;
        this.initialized = true;
        return;
      }

      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        this.firebaseEnabled = true;
        this.initialized = true;
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        this.firebaseEnabled = false;
        this.initialized = true;
      }
    }
  }

  private mapPriority(priority: NotificationPriority): AndroidPriority {
    return priority === 'normal' ? 'default' : 'high';
  }

  public async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    options?: {
      priority?: NotificationPriority;
      ttl?: number;
      collapseKey?: string;
      badge?: number;
      sound?: string;
    },
  ) {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      if (!this.firebaseEnabled) {
        console.log('Push notification skipped (Firebase not configured):', {
          title,
          body,
        });
        return null;
      }

      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: options?.priority || 'high',
          ttl: options?.ttl ? options.ttl * 1000 : undefined,
          collapseKey: options?.collapseKey,
          notification: {
            channelId: 'wallpaper_notifications',
            priority: this.mapPriority(options?.priority || 'high'),
            defaultSound: true,
            defaultVibrateTimings: true,
            sound: options?.sound,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: options?.sound || 'default',
              badge: options?.badge || 1,
            },
          },
          headers: {
            'apns-priority': options?.priority === 'high' ? '10' : '5',
            'apns-expiration': options?.ttl ? options.ttl.toString() : '0',
          },
        },
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new CustomError('Failed to send notification', 500);
    }
  }

  public async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
    options?: {
      priority?: NotificationPriority;
      ttl?: number;
      collapseKey?: string;
      badge?: number;
      sound?: string;
    },
  ) {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: options?.priority || 'high',
          ttl: options?.ttl ? options.ttl * 1000 : undefined,
          collapseKey: options?.collapseKey,
          notification: {
            channelId: 'wallpaper_notifications',
            priority: this.mapPriority(options?.priority || 'high'),
            defaultSound: true,
            defaultVibrateTimings: true,
            sound: options?.sound,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: options?.sound || 'default',
              badge: options?.badge || 1,
            },
          },
          headers: {
            'apns-priority': options?.priority === 'high' ? '10' : '5',
            'apns-expiration': options?.ttl ? options.ttl.toString() : '0',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw new CustomError('Failed to send notifications', 500);
    }
  }

  public async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    type:
      | 'newWallpapers'
      | 'trendingWallpapers'
      | 'subscriptionUpdates'
      | 'systemUpdates'
      | 'marketingUpdates',
    data?: Record<string, string>,
    options?: {
      priority?: NotificationPriority;
      ttl?: number;
      collapseKey?: string;
      badge?: number;
      sound?: string;
    },
  ) {
    try {
      // Check user's notification preferences
      const preferences = await NotificationPreferences.findOne({ userId });

      if (!preferences) {
        console.log(`No notification preferences found for user ${userId}`);
        return null;
      }

      // Check if user has enabled this type of notification
      if (!preferences[type]) {
        console.log(`User ${userId} has disabled ${type} notifications`);
        return null;
      }

      // Check quiet hours
      if (
        preferences.quietHours.enabled &&
        isWithinQuietHours(preferences.quietHours)
      ) {
        console.log(`User ${userId} is in quiet hours`);
        return null;
      }

      // Get user's active device tokens
      const deviceTokens = await DeviceToken.find({
        userId,
        isActive: true,
      });

      if (deviceTokens.length === 0) {
        return null;
      }

      const tokens = deviceTokens.map((dt) => dt.token);
      return await this.sendMulticastNotification(
        tokens,
        title,
        body,
        data,
        options,
      );
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return null;
    }
  }

  public async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    options?: {
      priority?: NotificationPriority;
      ttl?: number;
      collapseKey?: string;
      badge?: number;
      sound?: string;
    },
  ) {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: options?.priority || 'high',
          ttl: options?.ttl ? options.ttl * 1000 : undefined,
          collapseKey: options?.collapseKey,
          notification: {
            channelId: 'wallpaper_notifications',
            priority: this.mapPriority(options?.priority || 'high'),
            defaultSound: true,
            defaultVibrateTimings: true,
            sound: options?.sound,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: options?.sound || 'default',
              badge: options?.badge || 1,
            },
          },
          headers: {
            'apns-priority': options?.priority === 'high' ? '10' : '5',
            'apns-expiration': options?.ttl ? options.ttl.toString() : '0',
          },
        },
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw new CustomError('Failed to send topic notification', 500);
    }
  }
}

export const notificationService = NotificationService.getInstance();
