import { z } from 'zod';
import { slugSchema } from './common.ts';

export const createServiceCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().max(512).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export const updateServiceCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().max(512).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>;
