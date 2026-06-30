import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().max(100).optional(),
  receiverName: z.string().min(1).max(255),
  receiverPhone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/),
  province: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  district: z.string().min(1).max(255),
  postalCode: z.string().min(3).max(10),
  address: z.string().min(1).max(500),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export const updateAddressSchema = z.object({
  label: z.string().max(100).optional(),
  receiverName: z.string().min(1).max(255).optional(),
  receiverPhone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/)
    .optional(),
  address: z.string().min(1).max(500).optional(),
  isDefault: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
