import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['Cash', 'Transfer', 'QRIS', 'E-Wallet', 'Other']),
  amount: z.coerce.number().min(0),
  proofMediaId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['Paid', 'Failed']),
  notes: z.string().max(500).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
