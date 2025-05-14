import { z } from 'zod';

export const subscriptionSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  purchaseToken: z.string().min(1, 'Purchase token is required'),
});
