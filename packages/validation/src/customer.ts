import { z } from 'zod';

export const updateCustomerSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  avatar: z.string().url().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  gender: z.enum(['L', 'P']).optional(),
  defaultAddressId: z.string().uuid().optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'blocked']),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
