import { z } from 'zod';

const SECTION_TYPES = [
  'hero',
  'services',
  'why-us',
  'stats',
  'testimonials',
  'cta',
  'faq',
] as const;

export const createHomepageSectionSchema = z.object({
  sectionType: z.enum(SECTION_TYPES),
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  imageMediaId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateHomepageSectionSchema = z.object({
  sectionType: z.enum(SECTION_TYPES).optional(),
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  imageMediaId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const reorderHomepageSectionsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export type CreateHomepageSectionInput = z.infer<typeof createHomepageSectionSchema>;
export type UpdateHomepageSectionInput = z.infer<typeof updateHomepageSectionSchema>;
export type ReorderHomepageSectionsInput = z.infer<typeof reorderHomepageSectionsSchema>;
