import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  newWallpapers: boolean;
  trendingWallpapers: boolean;
  subscriptionUpdates: boolean;
  systemUpdates: boolean;
  marketingUpdates: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // Format: "HH:mm"
    endTime: string; // Format: "HH:mm"
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    newWallpapers: {
      type: Boolean,
      default: true,
    },
    trendingWallpapers: {
      type: Boolean,
      default: true,
    },
    subscriptionUpdates: {
      type: Boolean,
      default: true,
    },
    systemUpdates: {
      type: Boolean,
      default: true,
    },
    marketingUpdates: {
      type: Boolean,
      default: false,
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: String,
        default: '22:00',
      },
      endTime: {
        type: String,
        default: '08:00',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
  },
  {
    timestamps: true,
  },
);

export const NotificationPreferences = mongoose.model<INotificationPreferences>(
  'NotificationPreferences',
  notificationPreferencesSchema,
);
