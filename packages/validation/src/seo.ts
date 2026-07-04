import { z } from 'zod';
import { uuidSchema } from './common.ts';

const entityTypeSchema = z.enum(['Service', 'Article', 'Category', 'Landing Page']);

export const upsertSeoSchema = z.object({
  entityType: entityTypeSchema,
  entityId: uuidSchema,
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  canonicalUrl: z.string().url().max(255).optional().nullable(),
  robots: z.string().max(100).optional().nullable(),
  ogTitle: z.string().max(100).optional().nullable(),
  ogDescription: z.string().max(300).optional().nullable(),
  ogImage: z.string().url().max(255).optional().nullable(),
  twitterTitle: z.string().max(100).optional().nullable(),
  twitterDescription: z.string().max(300).optional().nullable(),
  twitterImage: z.string().url().max(255).optional().nullable(),
  schemaJson: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type UpsertSeoInput = z.infer<typeof upsertSeoSchema>;
