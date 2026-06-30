import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const phoneSchema = z
  .string()
  .min(10)
  .max(30)
  .regex(/^\+?[0-9]+$/, 'Nomor HP hanya boleh angka dan +');

export const slugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan -');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  q: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
