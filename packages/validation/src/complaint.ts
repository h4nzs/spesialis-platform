import { z } from 'zod';

export const createComplaintSchema = z.object({
  orderId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(5000),
});

export const resolveComplaintSchema = z.object({
  resolution: z.string().min(1).max(5000),
  status: z.enum(['Resolved', 'Closed']),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
