import { z } from 'zod';

export const createCompanySchema = z.object({
  companyName: z.string().min(1).max(255),
  legalName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/),
  password: z.string().min(8).max(128),
  website: z.string().url().max(255).optional(),
  industry: z.string().max(255).optional(),
  employeeCount: z.coerce.number().int().min(1).optional(),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  legalName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/)
    .optional(),
  website: z.string().url().max(255).optional().nullable(),
  industry: z.string().max(255).optional(),
  employeeCount: z.coerce.number().int().min(1).optional(),
});

export const verifyCompanySchema = z.object({
  status: z.enum(['Verified', 'Rejected']),
  note: z.string().max(500).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type VerifyCompanyInput = z.infer<typeof verifyCompanySchema>;
