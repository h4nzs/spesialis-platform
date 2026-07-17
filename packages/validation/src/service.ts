import { z } from 'zod';

export const createServiceSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().max(300).optional(),
  description: z.string().optional(),
  thumbnail: z.string().max(255).optional().nullable(),
  basePrice: z.string().min(1),
  estimatedDuration: z.coerce.number().int().min(1).optional(),
  warrantyDays: z.coerce.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  showInHero: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().max(255).optional().nullable(),
  basePrice: z.string().optional(),
  estimatedDuration: z.coerce.number().int().min(1).optional().nullable(),
  warrantyDays: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  showInHero: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
