import { z } from 'zod';

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const notificationPreferencesSchema = z.object({
  newWallpapers: z.boolean().optional(),
  trendingWallpapers: z.boolean().optional(),
  subscriptionUpdates: z.boolean().optional(),
  systemUpdates: z.boolean().optional(),
  marketingUpdates: z.boolean().optional(),
});

export const quietHoursSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string().regex(timeRegex, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Invalid time format (HH:mm)'),
  timezone: z.string().min(1, 'Timezone is required'),
});
