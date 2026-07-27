import { z } from 'zod';

export const createBlogAdSchema = z.object({
  title: z.string().min(1).max(255),
  imageUrl: z.string().min(1),
  caption: z.string().max(500).optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const updateBlogAdSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  imageUrl: z.string().min(1).optional(),
  caption: z.string().max(500).optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateBlogAdInput = z.infer<typeof createBlogAdSchema>;
export type UpdateBlogAdInput = z.infer<typeof updateBlogAdSchema>;
