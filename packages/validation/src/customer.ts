import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1).max(255),
  guestPhone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/)
    .optional(),
});

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

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
