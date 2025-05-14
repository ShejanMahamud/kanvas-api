import { google } from 'googleapis';
import config from '../config';
import { CustomError } from '../utils/customError';

const androidPublisher = google.androidpublisher('v3');

interface SubscriptionVerificationResult {
  isValid: boolean;
  tier: 'basic' | 'premium';
  expiryDate: Date;
}

export class GooglePlayService {
  private static instance: GooglePlayService;
  private auth: any;

  private constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googlePlay.clientEmail,
        private_key: config.googlePlay.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
  }

  public static getInstance(): GooglePlayService {
    if (!GooglePlayService.instance) {
      GooglePlayService.instance = new GooglePlayService();
    }
    return GooglePlayService.instance;
  }

  public async verifySubscription(
    packageName: string,
    subscriptionId: string,
    purchaseToken: string,
  ): Promise<SubscriptionVerificationResult> {
    try {
      const auth = await this.auth.getClient();
      const response = await androidPublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId,
        token: purchaseToken,
        auth,
      });

      const subscription = response.data;

      if (!subscription) {
        throw new CustomError('Invalid subscription', 400);
      }

      // Check if subscription is active
      const expiryTimeMillis = subscription.expiryTimeMillis
        ? Number(subscription.expiryTimeMillis)
        : 0;
      const isValid =
        subscription.paymentState === 1 && expiryTimeMillis > Date.now();

      // Determine subscription tier based on productId
      const tier = this.getSubscriptionTier(subscriptionId);

      return {
        isValid,
        tier,
        expiryDate: new Date(expiryTimeMillis),
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error verifying subscription', 500);
    }
  }

  private getSubscriptionTier(subscriptionId: string): 'basic' | 'premium' {
    // Map subscription IDs to tiers
    const subscriptionTiers: Record<string, 'basic' | 'premium'> = {
      'com.yourapp.subscription.basic': 'basic',
      'com.yourapp.subscription.premium': 'premium',
    };

    return subscriptionTiers[subscriptionId] || 'basic';
  }

  public async acknowledgeSubscription(
    packageName: string,
    subscriptionId: string,
    purchaseToken: string,
  ): Promise<void> {
    try {
      const auth = await this.auth.getClient();
      await androidPublisher.purchases.subscriptions.acknowledge({
        packageName,
        subscriptionId,
        token: purchaseToken,
        requestBody: {},
        auth,
      });
    } catch (error) {
      throw new CustomError('Error acknowledging subscription', 500);
    }
  }
}
