import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceType: 'android' | 'ios' | 'web';
  deviceId: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'web'],
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
deviceTokenSchema.index({ userId: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ deviceId: 1 });
deviceTokenSchema.index({ isActive: 1 });

export const DeviceToken = mongoose.model<IDeviceToken>(
  'DeviceToken',
  deviceTokenSchema,
);
