import { z } from 'zod';

export const markNotificationReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
