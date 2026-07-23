import { z } from 'zod';

export const createFaqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  category: z.string().max(100).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const updateFaqSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().max(100).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
