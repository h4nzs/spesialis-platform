import { z } from 'zod';

export const createRedirectSchema = z.object({
  sourcePath: z.string().min(1, 'Source path wajib diisi').max(500),
  targetPath: z.string().min(1, 'Target path wajib diisi'),
  statusCode: z.coerce
    .number()
    .int()
    .refine((v) => v === 301 || v === 302, {
      message: 'Status code harus 301 atau 302',
    })
    .default(301),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateRedirectSchema = z.object({
  sourcePath: z.string().min(1).max(500).optional(),
  targetPath: z.string().min(1).optional(),
  statusCode: z.coerce
    .number()
    .int()
    .refine((v) => v === 301 || v === 302)
    .optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;
