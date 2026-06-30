import { z } from 'zod';

export const orderItemSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  basePrice: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Confirmed', 'Waiting Assignment', 'Completed', 'Cancelled', 'Closed']),
  note: z.string().max(500).optional(),
});

export const updatePriceSchema = z.object({
  finalPrice: z.coerce.number().min(0),
  note: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePriceInput = z.infer<typeof updatePriceSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
