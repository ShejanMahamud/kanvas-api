import { z } from 'zod';

// Base wallpaper schema
const wallpaperBaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category must not exceed 50 characters')
    .trim(),
  tags: z
    .array(z.string().min(2).max(30))
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed')
    .transform((tags) => tags.map((tag) => tag.trim().toLowerCase())),
  isPremium: z.boolean().default(false),
  subscriptionTier: z.enum(['free', 'basic', 'premium']).default('free'),
});

// Upload wallpaper schema
export const uploadWallpaperSchema = wallpaperBaseSchema.extend({
  image: z
    .any()
    .refine(
      (file) => file && file.mimetype.startsWith('image/'),
      'Only image files are allowed',
    )
    .refine(
      (file) => file && file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB',
    ),
});

// Update wallpaper schema
export const updateWallpaperSchema = wallpaperBaseSchema.partial();

// Query parameters schema
export const wallpaperQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive number')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val > 0 && val <= 50,
      'Limit must be between 1 and 50',
    )
    .optional(),
});

// Search query schema
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .optional(),
  category: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive number')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val > 0 && val <= 50,
      'Limit must be between 1 and 50',
    )
    .optional(),
});

// Params schema
export const wallpaperParamsSchema = z.object({
  wallpaperId: z
    .string()
    .refine(
      (id) => /^[0-9a-fA-F]{24}$/.test(id),
      'Invalid wallpaper ID format',
    ),
});

// Limit query schema for popular and most downloaded wallpapers
export const limitQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});
