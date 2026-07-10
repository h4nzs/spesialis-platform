import { z } from 'zod';

export const createCmsPageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  content: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});

export const updateCmsPageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung')
    .optional(),
  content: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});

export type CreateCmsPageInput = z.infer<typeof createCmsPageSchema>;
export type UpdateCmsPageInput = z.infer<typeof updateCmsPageSchema>;
