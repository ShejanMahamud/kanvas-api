import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
  deleteFromCloudinary,
  generateOptimizedUrl,
  uploadToCloudinary,
} from '../helpers/cloudinary';
import { User } from '../models/user.model';
import { Wallpaper } from '../models/wallpaper.model';
import { CustomError } from '../utils/customError';
import logger from '../utils/logger';

interface WallpaperQuery {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  isPremium?: boolean | string;
  subscriptionTier?: 'free' | 'basic' | 'premium';
}

interface SearchQuery {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface WallpaperRequestBody {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  subscriptionTier?: 'free' | 'basic' | 'premium';
}

export const uploadWallpaper = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new CustomError('No file uploaded', 400);
    }

    const {
      title,
      description,
      category,
      tags,
      isPremium = false,
      subscriptionTier = 'free',
    } = req.body;
    const uploadedBy = req.user?._id;

    if (!uploadedBy) {
      throw new CustomError('User not authenticated', 401);
    }

    // Upload original image to Cloudinary with optimizations
    const uploadResult = await uploadToCloudinary(req.file, {
      folder: 'wallpapers',
      transformation: [
        { width: 1920, height: 1080, crop: 'fill' }, // Optimize for common wallpaper resolution
        { quality: 'auto:best' }, // Best quality while maintaining reasonable file size
        { fetch_format: 'auto' }, // Automatically choose the best format
      ],
    });

    // Generate thumbnail URL with smaller dimensions
    const thumbnailUrl = generateOptimizedUrl(uploadResult.public_id, {
      width: 400,
      height: 225,
      quality: 'auto:good',
      crop: 'fill',
    });

    const wallpaper = new Wallpaper({
      title,
      description,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      thumbnailUrl,
      category,
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy,
      isPremium,
      subscriptionTier,
    });

    await wallpaper.save();

    // Log successful upload
    logger.info(
      `Wallpaper uploaded successfully: ${wallpaper._id} by user: ${uploadedBy}`,
    );

    res.status(201).json({
      success: true,
      data: wallpaper,
    });
  } catch (error) {
    // Log error
    logger.error('Error uploading wallpaper:', error);

    if (error instanceof CustomError) throw error;
    throw new CustomError('Error uploading wallpaper', 500);
  }
};

export const listWallpapers = async (
  req: Request<unknown, unknown, unknown, WallpaperQuery>,
  res: Response,
) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 10,
      isPremium,
      subscriptionTier,
    } = req.query;
    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Handle premium content filtering
    if (isPremium !== undefined) {
      query.isPremium = isPremium === 'true' || isPremium === true;
    }

    if (subscriptionTier) {
      query.subscriptionTier = subscriptionTier;
    }

    const wallpapers = await Wallpaper.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Wallpaper.countDocuments(query);

    res.json({
      success: true,
      data: {
        wallpapers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    throw new CustomError('Error fetching wallpapers', 500);
  }
};

export const saveWallpaper = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    if (user.savedWallpapers.includes(new Types.ObjectId(id))) {
      throw new CustomError('Wallpaper already saved', 400);
    }

    user.savedWallpapers.push(new Types.ObjectId(id));
    await user.save();

    res.json({
      success: true,
      message: 'Wallpaper saved successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error saving wallpaper', 500);
  }
};

export const unsaveWallpaper = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    if (!user.savedWallpapers.includes(new Types.ObjectId(id))) {
      throw new CustomError('Wallpaper not saved', 400);
    }

    user.savedWallpapers = user.savedWallpapers.filter(
      (savedId) => savedId.toString() !== id,
    );
    await user.save();

    res.json({
      success: true,
      message: 'Wallpaper unsaved successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error unsaving wallpaper', 500);
  }
};

export const deleteWallpaper = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    if (wallpaper.uploadedBy.toString() !== userId.toString()) {
      throw new CustomError('Not authorized to delete this wallpaper', 403);
    }

    // Delete from Cloudinary
    if (wallpaper.cloudinaryId) {
      await deleteFromCloudinary(wallpaper.cloudinaryId);
    }

    await wallpaper.deleteOne();

    res.json({
      success: true,
      message: 'Wallpaper deleted successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error deleting wallpaper', 500);
  }
};

export const getSavedWallpapers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const user = await User.findById(userId).populate('savedWallpapers');
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      data: user.savedWallpapers,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching saved wallpapers', 500);
  }
};

export const searchWallpapers = async (
  req: Request<unknown, unknown, unknown, SearchQuery>,
  res: Response,
) => {
  try {
    const { query, category, page = 1, limit = 10 } = req.query;
    const searchQuery: Record<string, unknown> = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (category) {
      searchQuery.category = category;
    }

    const wallpapers = await Wallpaper.find(searchQuery)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Wallpaper.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        wallpapers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error searching wallpapers', 500);
  }
};

export const getWallpaperById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id).populate(
      'uploadedBy',
      'name email',
    );

    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    res.json({
      success: true,
      data: wallpaper,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching wallpaper', 500);
  }
};

export const getWallpaperStats = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const wallpaper = await Wallpaper.findById(id);

    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    // Get daily stats for the last 30 days
    const dailyStats = await Wallpaper.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $project: {
          downloads: 1,
          views: 1,
          likes: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        downloads: wallpaper.downloads,
        views: wallpaper.views,
        likes: wallpaper.likes,
        dailyStats,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching wallpaper stats', 500);
  }
};

export const getWallpaperCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Wallpaper.distinct('category');
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching categories', 500);
  }
};

export const getPopularWallpapers = async (
  req: Request<unknown, unknown, unknown, { limit?: number }>,
  res: Response,
) => {
  try {
    const { limit = 10 } = req.query;
    const wallpapers = await Wallpaper.find()
      .sort({ views: -1 })
      .limit(limit)
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      data: wallpapers,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching popular wallpapers', 500);
  }
};

export const getMostDownloadedWallpapers = async (
  req: Request<unknown, unknown, unknown, { limit?: number }>,
  res: Response,
) => {
  try {
    const { limit = 10 } = req.query;
    const wallpapers = await Wallpaper.find()
      .sort({ downloads: -1 })
      .limit(limit)
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      data: wallpapers,
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error fetching most downloaded wallpapers', 500);
  }
};

export const checkSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: req.hasActiveSubscription || false,
        subscription: req.subscription,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error checking subscription status', 500);
  }
};

export const updateWallpaper = async (
  req: Request<{ id: string }, unknown, WallpaperRequestBody>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { title, description, category, tags, isPremium, subscriptionTier } =
      req.body;

    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      throw new CustomError('Wallpaper not found', 404);
    }

    // Check if user is authorized to update the wallpaper
    if (wallpaper.uploadedBy.toString() !== userId.toString()) {
      throw new CustomError('Not authorized to update this wallpaper', 403);
    }

    // Update wallpaper fields
    if (title) wallpaper.title = title;
    if (description) wallpaper.description = description;
    if (category) wallpaper.category = category;
    if (tags) wallpaper.tags = tags;
    if (isPremium !== undefined) wallpaper.isPremium = isPremium;
    if (subscriptionTier) wallpaper.subscriptionTier = subscriptionTier;

    await wallpaper.save();

    // Log successful update
    logger.info(
      `Wallpaper updated successfully: ${wallpaper._id} by user: ${userId}`,
    );

    res.json({
      success: true,
      data: wallpaper,
    });
  } catch (error) {
    // Log error
    logger.error('Error updating wallpaper:', error);

    if (error instanceof CustomError) throw error;
    throw new CustomError('Error updating wallpaper', 500);
  }
};
