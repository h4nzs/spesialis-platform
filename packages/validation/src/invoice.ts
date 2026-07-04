import { z } from 'zod';
import { uuidSchema } from './common.ts';

export const createInvoiceSchema = z.object({
  companyId: uuidSchema,
  orderId: uuidSchema.optional().nullable(),
  amount: z.coerce.number().min(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['Draft', 'Issued', 'Paid', 'Overdue', 'Cancelled']),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
