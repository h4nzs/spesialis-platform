import { z } from 'zod';

export const assignSchema = z.object({
  partnerId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export const acceptSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type AssignInput = z.infer<typeof assignSchema>;
export type AcceptInput = z.infer<typeof acceptSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
