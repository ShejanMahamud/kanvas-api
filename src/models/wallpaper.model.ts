import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWallpaper extends Document {
  title: string;
  description: string;
  imageUrl: string;
  cloudinaryId: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  views: number;
  downloads: number;
  saves: number;
  likes: number;
  isPremium: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

const wallpaperSchema = new Schema<IWallpaper>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary ID is required'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better search performance
wallpaperSchema.index({ title: 'text', description: 'text', tags: 'text' });
wallpaperSchema.index({ category: 1 });
wallpaperSchema.index({ uploadedBy: 1 });
wallpaperSchema.index({ isPremium: 1, subscriptionTier: 1 });

export const Wallpaper: Model<IWallpaper> = mongoose.model<IWallpaper>(
  'Wallpaper',
  wallpaperSchema,
);
