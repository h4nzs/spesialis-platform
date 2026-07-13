import { z } from 'zod';

export const createCoverageAreaSchema = z.object({
  city: z.string().min(1).max(100),
  note: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const updateCoverageAreaSchema = z.object({
  city: z.string().min(1).max(100).optional(),
  note: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateCoverageAreaInput = z.infer<typeof createCoverageAreaSchema>;
export type UpdateCoverageAreaInput = z.infer<typeof updateCoverageAreaSchema>;
