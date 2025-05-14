import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: string;
  productId: string;
  purchaseToken: string;
  tier: 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled' | 'paused' | 'pending' | 'failed';
  startDate: Date;
  expiryDate: Date;
  autoRenewing: boolean;
  paymentState: number;
  priceAmount: number;
  priceCurrency: string;
  countryCode: string;
  developerPayload?: string;
  orderId: string;
  purchaseType: 'subscription' | 'one_time';
  gracePeriodEndDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    purchaseToken: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ['basic', 'premium'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'paused', 'pending', 'failed'],
      default: 'pending',
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    autoRenewing: {
      type: Boolean,
      default: true,
    },
    paymentState: {
      type: Number,
      required: true,
    },
    priceAmount: {
      type: Number,
      required: true,
    },
    priceCurrency: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    developerPayload: {
      type: String,
    },
    orderId: {
      type: String,
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ['subscription', 'one_time'],
      default: 'subscription',
    },
    gracePeriodEndDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ subscriptionId: 1 });
subscriptionSchema.index({ status: 1, expiryDate: 1 });
subscriptionSchema.index({ orderId: 1 }, { unique: true });
subscriptionSchema.index({ purchaseToken: 1 }, { unique: true });

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema,
);
