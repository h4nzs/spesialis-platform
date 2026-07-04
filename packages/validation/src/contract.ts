import { z } from 'zod';
import { uuidSchema } from './common.ts';

export const createContractSchema = z.object({
  companyId: uuidSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  slaResponseHours: z.coerce.number().int().min(0).optional().nullable(),
  slaResolutionHours: z.coerce.number().int().min(0).optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  discountAmount: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial().omit({ companyId: true });

export const updateContractStatusSchema = z.object({
  status: z.enum(['Draft', 'Active', 'Expired', 'Terminated']),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>;
