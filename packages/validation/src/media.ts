import { z } from 'zod';

export const uploadMediaSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/),
  extension: z.string().min(1).max(10),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(50 * 1024 * 1024),
  width: z.coerce.number().int().min(0).optional(),
  height: z.coerce.number().int().min(0).optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
