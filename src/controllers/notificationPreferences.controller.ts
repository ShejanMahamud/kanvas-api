import { Request, Response } from 'express';
import { NotificationPreferences } from '../models/notificationPreferences.model';
import { CustomError } from '../utils/customError';

export const getNotificationPreferences = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    let preferences = await NotificationPreferences.findOne({ userId });

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await NotificationPreferences.create({
        userId,
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching notification preferences', 500);
  }
};

export const updateNotificationPreferences = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id;
    const updates = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const preferences = await NotificationPreferences.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error updating notification preferences', 500);
  }
};

export const updateQuietHours = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { enabled, startTime, endTime, timezone } = req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const preferences = await NotificationPreferences.findOneAndUpdate(
      { userId },
      {
        $set: {
          'quietHours.enabled': enabled,
          'quietHours.startTime': startTime,
          'quietHours.endTime': endTime,
          'quietHours.timezone': timezone,
        },
      },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      data: preferences.quietHours,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error updating quiet hours', 500);
  }
};
