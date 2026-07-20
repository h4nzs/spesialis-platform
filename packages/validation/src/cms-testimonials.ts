import { z } from 'zod';

export const createTestimonialSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().max(200).optional().nullable(),
  role: z.string().max(200).optional().nullable(),
  quote: z.string().min(1),
  rating: z.coerce.number().min(1).max(5).optional(),
  avatar: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const updateTestimonialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional().nullable(),
  role: z.string().max(200).optional().nullable(),
  quote: z.string().min(1).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  avatar: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
