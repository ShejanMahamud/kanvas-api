import { z } from 'zod';

export const deviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  deviceType: z.enum(['android', 'ios', 'web'], {
    errorMap: () => ({ message: 'Invalid device type' }),
  }),
  deviceId: z.string().min(1, 'Device ID is required'),
});

export const unregisterTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
});
