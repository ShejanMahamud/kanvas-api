import { NextFunction, Request, Response } from 'express';
import { ISubscription, Subscription } from '../models/subscription.model';
import { CustomError } from '../utils/customError';

// Extend Express Request type
declare module 'express' {
  interface Request {
    subscription?: ISubscription;
    hasActiveSubscription?: boolean;
  }
}

export const checkSubscription = (
  requiredTier: 'basic' | 'premium' = 'basic',
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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

      if (!subscription) {
        throw new CustomError('Subscription required', 403);
      }

      // Check if user's subscription tier is sufficient
      if (requiredTier === 'premium' && subscription.tier !== 'premium') {
        throw new CustomError('Premium subscription required', 403);
      }

      // Add subscription info to request for use in controllers
      req.subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user has any active subscription
export const hasActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    // Add subscription status to request
    req.hasActiveSubscription = !!subscription;
    next();
  } catch (error) {
    next(error);
  }
};
