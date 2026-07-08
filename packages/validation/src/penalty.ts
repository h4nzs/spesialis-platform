import { z } from 'zod';

export const penaltyTypeEnum = z.enum(['Late', 'NoShow', 'Cancellation', 'Complaint', 'Other']);
export const penaltyStatusEnum = z.enum(['Pending', 'Applied', 'Waived', 'Disputed']);

export const imposePenaltySchema = z.object({
  partnerId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  type: penaltyTypeEnum,
  amount: z.coerce.number().min(0),
  reason: z.string().min(1).max(1000),
  notes: z.string().max(1000).optional(),
});

export const updatePenaltyStatusSchema = z.object({
  status: z.enum(['Applied', 'Waived']),
  notes: z.string().max(1000).optional(),
});

export type ImposePenaltyInput = z.infer<typeof imposePenaltySchema>;
export type UpdatePenaltyStatusInput = z.infer<typeof updatePenaltyStatusSchema>;
