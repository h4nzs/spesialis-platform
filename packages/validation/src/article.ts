import { z } from 'zod';

const articleStatusEnum = z.enum(['Draft', 'Review', 'Published', 'Archived']);

export const createArticleCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export const updateArticleCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export const createArticleSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
  coverImage: z.string().max(255).optional(),
  authorName: z.string().max(255).optional(),
  status: articleStatusEnum.optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(320).optional(),
  ogTitle: z.string().max(255).optional(),
  ogDescription: z.string().max(500).optional(),
  ogImage: z.string().max(500).optional(),
  canonicalUrl: z.string().max(500).optional(),
  robots: z.string().max(100).optional(),
});

export const updateArticleSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  summary: z.string().max(500).optional().nullable(),
  content: z.string().optional().nullable(),
  coverImage: z.string().max(255).optional().nullable(),
  authorName: z.string().max(255).optional().nullable(),
  status: articleStatusEnum.optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  robots: z.string().max(100).optional().nullable(),
});

export type CreateArticleCategoryInput = z.infer<typeof createArticleCategorySchema>;
export type UpdateArticleCategoryInput = z.infer<typeof updateArticleCategorySchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
