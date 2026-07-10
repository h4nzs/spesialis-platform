import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128)
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka');

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .max(30)
    .regex(/^\+?[0-9]+$/, 'Nomor HP hanya boleh angka dan +'),
  password: passwordSchema,
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(255),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token reset password wajib diisi'),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255).optional(),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .max(30)
    .regex(/^\+?[0-9]+$/, 'Nomor HP hanya boleh angka dan +')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password wajib diisi untuk konfirmasi'),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked', 'suspended', 'deleted']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([
    'customer',
    'partner',
    'corporate',
    'admin',
    'super_admin',
    'dispatcher',
    'finance',
    'content_manager',
  ]),
});

export const convertGuestSchema = z.object({
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .max(30)
    .regex(/^\+?[0-9]+$/, 'Nomor HP hanya boleh angka dan +'),
  email: z.string().email('Format email tidak valid').max(255),
  password: passwordSchema,
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(255),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token wajib diisi'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token verifikasi wajib diisi'),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ConvertGuestInput = z.infer<typeof convertGuestSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
