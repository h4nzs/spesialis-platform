import { z } from 'zod';

export const createCorporateInquirySchema = z.object({
  companyName: z.string().min(1).max(255),
  legalName: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  industry: z.string().max(255).optional(),
  employeeCount: z.coerce.number().int().min(1).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCorporateInquirySchema = z.object({
  status: z.enum(['Pending', 'Contacted', 'Negotiation', 'Converted', 'Closed']),
  notes: z.string().max(1000).optional(),
});

export type CreateCorporateInquiryInput = z.infer<typeof createCorporateInquirySchema>;
export type UpdateCorporateInquiryInput = z.infer<typeof updateCorporateInquirySchema>;
