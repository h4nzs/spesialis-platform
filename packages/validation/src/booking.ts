import { z } from 'zod';

const orderItemSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export const createGuestBookingSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: z
    .string()
    .min(10)
    .max(30)
    .regex(/^\+?[0-9]+$/),
  address: z.object({
    province: z.string().min(1).max(255),
    city: z.string().min(1).max(255),
    district: z.string().min(1).max(255),
    postalCode: z.string().min(3).max(10),
    address: z.string().min(1).max(500),
    receiverName: z.string().min(1).max(255),
    receiverPhone: z
      .string()
      .min(10)
      .max(30)
      .regex(/^\+?[0-9]+$/),
  }),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1),
});

export const createCustomerBookingSchema = z.object({
  addressId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1),
});

export const confirmBookingSchema = z.object({
  finalPrice: z.coerce.number().min(0).optional(),
  note: z.string().max(500).optional(),
});

export const assignPartnerSchema = z.object({
  partnerId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export const acceptAssignmentSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectAssignmentSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type CreateGuestBookingInput = z.infer<typeof createGuestBookingSchema>;
export type CreateCustomerBookingInput = z.infer<typeof createCustomerBookingSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
export type AssignPartnerInput = z.infer<typeof assignPartnerSchema>;
export type AcceptAssignmentInput = z.infer<typeof acceptAssignmentSchema>;
export type RejectAssignmentInput = z.infer<typeof rejectAssignmentSchema>;
