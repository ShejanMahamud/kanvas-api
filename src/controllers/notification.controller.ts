import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { DeviceToken } from '../models/deviceToken.model';
import { notificationService } from '../services/notification.service';
import { CustomError } from '../utils/customError';

export const registerDeviceToken = async (req: Request, res: Response) => {
  try {
    const { token, deviceType, deviceId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    // Check if token already exists
    let deviceToken = await DeviceToken.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.userId = new Types.ObjectId(userId.toString());
      deviceToken.deviceType = deviceType;
      deviceToken.deviceId = deviceId;
      deviceToken.isActive = true;
      deviceToken.lastUsed = new Date();
    } else {
      // Create new token
      deviceToken = new DeviceToken({
        userId: new Types.ObjectId(userId.toString()),
        token,
        deviceType,
        deviceId,
      });
    }

    await deviceToken.save();

    res.json({
      success: true,
      message: 'Device token registered successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error registering device token', 500);
  }
};

export const unregisterDeviceToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const deviceToken = await DeviceToken.findOne({ token, userId });

    if (!deviceToken) {
      throw new CustomError('Device token not found', 404);
    }

    deviceToken.isActive = false;
    await deviceToken.save();

    res.json({
      success: true,
      message: 'Device token unregistered successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error unregistering device token', 500);
  }
};

export const getUserDeviceTokens = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
    }).select('-token'); // Exclude sensitive data

    res.json({
      success: true,
      data: deviceTokens,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching device tokens', 500);
  }
};

// Helper function to send notification to a user
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) => {
  try {
    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
    });

    if (deviceTokens.length === 0) {
      return null;
    }

    const tokens = deviceTokens.map((dt) => dt.token);
    return await notificationService.sendMulticastNotification(
      tokens,
      title,
      body,
      data,
    );
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return null;
  }
};
