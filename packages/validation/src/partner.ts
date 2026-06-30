import { z } from 'zod';

export const registerPartnerSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/),
  ktpNumber: z.string().min(1).max(30),
});

export const updatePartnerSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/)
    .optional(),
  bio: z.string().max(1000).optional(),
  experienceYear: z.coerce.number().int().min(0).optional(),
});

export const updateAvailabilitySchema = z.object({
  availability: z.enum(['Available', 'Busy', 'Vacation', 'Offline']),
});

export const verifyPartnerSchema = z.object({
  verificationStatus: z.enum(['Approved', 'Rejected']),
  note: z.string().max(500).optional(),
});

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
