import { Request, Response } from 'express';
import { Subscription } from '../models/subscription.model';
import { GooglePlayService } from '../services/googlePlay.service';
import { CustomError } from '../utils/customError';

export const verifyAndSaveSubscription = async (
  req: Request,
  res: Response,
) => {
  try {
    const { packageName, subscriptionId, purchaseToken } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    // Verify subscription with Google Play
    const googlePlayService = GooglePlayService.getInstance();
    const verificationResult = await googlePlayService.verifySubscription(
      packageName,
      subscriptionId,
      purchaseToken,
    );

    if (!verificationResult.isValid) {
      throw new CustomError('Invalid subscription', 400);
    }

    // Save or update subscription in database
    const subscription = await Subscription.findOneAndUpdate(
      {
        userId,
        subscriptionId,
      },
      {
        userId,
        subscriptionId,
        productId: subscriptionId,
        purchaseToken,
        tier: verificationResult.tier,
        status: 'active',
        startDate: new Date(),
        expiryDate: verificationResult.expiryDate,
        autoRenewing: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Acknowledge the subscription with Google Play
    await googlePlayService.acknowledgeSubscription(
      packageName,
      subscriptionId,
      purchaseToken,
    );

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error processing subscription', 500);
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    });

    res.json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        tier: subscription?.tier || 'free',
        expiryDate: subscription?.expiryDate,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching subscription status', 500);
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
    });

    if (!subscription) {
      throw new CustomError('No active subscription found', 404);
    }

    subscription.status = 'cancelled';
    subscription.autoRenewing = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error cancelling subscription', 500);
  }
};

export const handleSubscriptionWebhook = async (
  req: Request,
  res: Response,
) => {
  try {
    const { message } = req.body;
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());

    // Handle different notification types
    switch (data.notificationType) {
      case 'SUBSCRIPTION_PURCHASED':
      case 'SUBSCRIPTION_RENEWED':
        await handleSubscriptionRenewal(data);
        break;
      case 'SUBSCRIPTION_EXPIRED':
      case 'SUBSCRIPTION_CANCELED':
        await handleSubscriptionExpiry(data);
        break;
      case 'SUBSCRIPTION_RECOVERED':
        await handleSubscriptionRecovery(data);
        break;
      case 'SUBSCRIPTION_PAUSED':
        await handleSubscriptionPause(data);
        break;
      case 'SUBSCRIPTION_RESTARTED':
        await handleSubscriptionRestart(data);
        break;
      case 'SUBSCRIPTION_PRORATED':
        await handleSubscriptionProration(data);
        break;
      case 'SUBSCRIPTION_DEFERRED':
        await handleSubscriptionDeferral(data);
        break;
      default:
        console.log('Unhandled notification type:', data.notificationType);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
};

async function handleSubscriptionRenewal(data: any) {
  const { subscriptionId, purchaseToken, packageName } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  const googlePlayService = GooglePlayService.getInstance();
  const verificationResult = await googlePlayService.verifySubscription(
    packageName,
    subscriptionId,
    purchaseToken,
  );

  if (verificationResult.isValid) {
    subscription.status = 'active';
    subscription.expiryDate = verificationResult.expiryDate;
    subscription.autoRenewing = true;
    await subscription.save();
  }
}

async function handleSubscriptionExpiry(data: any) {
  const { subscriptionId } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  subscription.status = 'expired';
  subscription.autoRenewing = false;
  await subscription.save();
}

async function handleSubscriptionRecovery(data: any) {
  const { subscriptionId, purchaseToken, packageName } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  const googlePlayService = GooglePlayService.getInstance();
  const verificationResult = await googlePlayService.verifySubscription(
    packageName,
    subscriptionId,
    purchaseToken,
  );

  if (verificationResult.isValid) {
    subscription.status = 'active';
    subscription.expiryDate = verificationResult.expiryDate;
    await subscription.save();
  }
}

async function handleSubscriptionPause(data: any) {
  const { subscriptionId } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  subscription.status = 'paused';
  await subscription.save();
}

async function handleSubscriptionRestart(data: any) {
  const { subscriptionId, purchaseToken, packageName } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  const googlePlayService = GooglePlayService.getInstance();
  const verificationResult = await googlePlayService.verifySubscription(
    packageName,
    subscriptionId,
    purchaseToken,
  );

  if (verificationResult.isValid) {
    subscription.status = 'active';
    subscription.expiryDate = verificationResult.expiryDate;
    await subscription.save();
  }
}

async function handleSubscriptionProration(data: any) {
  const { subscriptionId, purchaseToken, packageName } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  const googlePlayService = GooglePlayService.getInstance();
  const verificationResult = await googlePlayService.verifySubscription(
    packageName,
    subscriptionId,
    purchaseToken,
  );

  if (verificationResult.isValid) {
    subscription.expiryDate = verificationResult.expiryDate;
    await subscription.save();
  }
}

async function handleSubscriptionDeferral(data: any) {
  const { subscriptionId, purchaseToken, packageName } = data;

  const subscription = await Subscription.findOne({ subscriptionId });
  if (!subscription) return;

  const googlePlayService = GooglePlayService.getInstance();
  const verificationResult = await googlePlayService.verifySubscription(
    packageName,
    subscriptionId,
    purchaseToken,
  );

  if (verificationResult.isValid) {
    subscription.expiryDate = verificationResult.expiryDate;
    await subscription.save();
  }
}

// Add subscription history tracking
export const getSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .select('-purchaseToken'); // Exclude sensitive data

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching subscription history', 500);
  }
};
