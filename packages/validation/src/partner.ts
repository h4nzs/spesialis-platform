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

export const addSkillSchema = z.object({
  categoryId: z.string().uuid(),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

export const partnerRegistrationSchema = z.object({
  email: z.string().email().max(255),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain digit'),
  fullName: z.string().min(1).max(255),
  ktpNumber: z.string().min(1).max(30),
});

export const createPartnerDocumentSchema = z.object({
  type: z.enum(['KTP', 'Certificate', 'SIM', 'Photo', 'Other']),
  mediaId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
});

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>;
export type CreatePartnerDocumentInput = z.infer<typeof createPartnerDocumentSchema>;
