import { Hono } from 'hono';
import { eq, and, or, isNull } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashToken,
} from '../lib/auth.ts';
import { db, users, customerProfiles, refreshTokens, passwordResets } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';
import { sendPasswordResetEmail, sendVerificationEmail } from '../lib/email.ts';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  convertGuestSchema,
} from '@specialist/validation';
import {
  success,
  created,
  error,
  notFound,
  unauthorized,
  conflict,
  serverError,
  forbidden,
  setAuthCookies,
  clearAuthCookies,
} from '../lib/response.ts';

const router = new Hono();

router.post('/register', rateLimit(10, 60_000), async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const { email, phone, password, fullName } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.phone, phone)))
    .limit(1);

  if (existing[0]) {
    return conflict(c, 'Email atau nomor HP sudah terdaftar');
  }

  const passwordHash = await hashPassword(password);

  const createdUsers = await db
    .insert(users)
    .values({
      email,
      phone,
      passwordHash,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  const user = createdUsers[0];
  if (!user) return serverError(c, 'Gagal membuat user');

  await db.insert(customerProfiles).values({
    userId: user.id,
    fullName,
  });

  const token = await signAccessToken(user.id, user.role);

  const verificationToken = generateRefreshToken();
  await db.insert(passwordResets).values({
    userId: user.id,
    tokenHash: hashToken(verificationToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  sendVerificationEmail(email, fullName, verificationToken);

  setAuthCookies(c, token);
  return created(c, { user: { id: user.id, email: user.email, role: user.role }, token });
});

router.post('/convert-guest', rateLimit(10, 60_000), async (c) => {
  const body = await c.req.json();
  const parsed = convertGuestSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const { phone, email, password, fullName } = parsed.data;

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.phone, phone)))
    .limit(1);

  if (existingUser[0]) {
    return conflict(c, 'Email atau nomor HP sudah terdaftar');
  }

  const [guestProfile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.guestPhone, phone),
        eq(customerProfiles.userId, null as unknown as string),
      ),
    )
    .limit(1);

  if (!guestProfile) {
    return error(c, 'GUEST_NOT_FOUND', 'Tidak ada booking guest dengan nomor HP ini', 404);
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email,
      phone,
      passwordHash,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!user) return serverError(c, 'Gagal membuat user');

  await db
    .update(customerProfiles)
    .set({
      userId: user.id,
      fullName,
      guestPhone: null,
    })
    .where(eq(customerProfiles.id, guestProfile.id));

  const token = await signAccessToken(user.id, user.role);

  setAuthCookies(c, token);
  return created(c, { user, token }, 'Akun berhasil dibuat');
});

router.post('/login', rateLimit(10, 60_000), async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return unauthorized(c, 'Email atau password salah');
  }

  if (user.status !== 'active') {
    return error(c, 'AUTH_ACCOUNT_BLOCKED', 'Akun tidak aktif', 403);
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return unauthorized(c, 'Email atau password salah');
  }

  const refreshToken = generateRefreshToken();
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  const token = await signAccessToken(user.id, user.role);

  setAuthCookies(c, token, refreshToken);
  return success(c, {
    user: { id: user.id, email: user.email, role: user.role },
    token,
    refreshToken,
  });
});

router.post('/refresh', rateLimit(20, 60_000), async (c) => {
  const body = (await c.req.json()) as { refreshToken?: string };
  if (!body.refreshToken) {
    return unauthorized(c, 'Refresh token required');
  }

  const [stored] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      revoked: refreshTokens.revoked,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, hashToken(body.refreshToken)),
        eq(refreshTokens.revoked, false),
      ),
    )
    .limit(1);

  if (!stored || stored.expiresAt < new Date()) {
    return unauthorized(c, 'Invalid or expired refresh token');
  }

  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, stored.userId))
    .limit(1);

  if (!user) {
    return unauthorized(c, 'User not found');
  }

  await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, stored.id));

  const newRefreshToken = generateRefreshToken();
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  const token = await signAccessToken(user.id, user.role);

  setAuthCookies(c, token, newRefreshToken);
  return success(c, { token, refreshToken: newRefreshToken });
});

router.post('/logout', authMiddleware, async (c) => {
  const userId = c.get('userId');

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));

  clearAuthCookies(c);
  return success(c, null, 'Logged out');
});

router.post('/forgot-password', rateLimit(5, 60_000), async (c) => {
  const body = await c.req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return success(c, null, 'Jika email terdaftar, link reset password akan dikirim');
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (user) {
    const resetToken = generateRefreshToken();
    await db.insert(passwordResets).values({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: getRefreshTokenExpiry(),
    });

    const displayName = user.email.split('@')[0] ?? 'Pengguna';
    sendPasswordResetEmail(user.email, displayName, resetToken).catch((err) => {
      console.error('Gagal mengirim email reset password:', err);
    });
  }

  return success(c, null, 'Jika email terdaftar, link reset password akan dikirim');
});

router.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const { token, password } = parsed.data;

  const [stored] = await db
    .select({
      id: passwordResets.id,
      userId: passwordResets.userId,
      used: passwordResets.used,
      expiresAt: passwordResets.expiresAt,
    })
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, hashToken(token)), eq(passwordResets.used, false)))
    .limit(1);

  if (!stored || stored.expiresAt < new Date()) {
    return error(c, 'INVALID_RESET_TOKEN', 'Token reset password tidak valid atau kadaluarsa', 400);
  }

  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, stored.userId));
    await tx.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, stored.id));
  });

  return success(c, null, 'Password berhasil direset');
});

router.post('/verify-email', async (c) => {
  const body = (await c.req.json()) as { token?: string };
  if (!body.token) {
    return error(c, 'VALIDATION_ERROR', 'Token verifikasi diperlukan', 422);
  }

  const [stored] = await db
    .select({
      id: passwordResets.id,
      userId: passwordResets.userId,
      used: passwordResets.used,
      expiresAt: passwordResets.expiresAt,
    })
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, hashToken(body.token)), eq(passwordResets.used, false)))
    .limit(1);

  if (!stored || stored.expiresAt < new Date()) {
    return error(
      c,
      'INVALID_VERIFICATION_TOKEN',
      'Token verifikasi tidak valid atau kadaluarsa',
      400,
    );
  }

  await db.transaction(async (tx) => {
    await tx.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, stored.userId));
    await tx.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, stored.id));
  });

  return success(c, null, 'Email berhasil diverifikasi');
});

router.post('/resend-verification', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [user] = await db
    .select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');
  if (user.emailVerifiedAt) {
    return success(c, null, 'Email sudah diverifikasi');
  }

  await db
    .update(passwordResets)
    .set({ used: true })
    .where(and(eq(passwordResets.userId, userId), eq(passwordResets.used, false)));

  const verificationToken = generateRefreshToken();
  await db.insert(passwordResets).values({
    userId,
    tokenHash: hashToken(verificationToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  const displayName = user.email.split('@')[0] ?? 'Pengguna';
  sendVerificationEmail(user.email, displayName, verificationToken);

  return success(c, null, 'Email verifikasi telah dikirim');
});

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return error(c, 'USER_NOT_FOUND', 'User tidak ditemukan', 404);
  }

  return success(c, { user });
});

router.patch('/profile', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  const updateData: Record<string, string> = {};

  if (parsed.data.email !== undefined) {
    if (parsed.data.email !== user.email) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, parsed.data.email), isNull(users.deletedAt)))
        .limit(1);
      if (existing) return conflict(c, 'Email sudah digunakan');
    }
    updateData.email = parsed.data.email;
  }

  if (parsed.data.phone !== undefined) {
    updateData.phone = parsed.data.phone;
  }

  if (Object.keys(updateData).length === 0) {
    return success(c, null, 'Tidak ada data yang diubah');
  }

  const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning({
    id: users.id,
    email: users.email,
    phone: users.phone,
    role: users.role,
    status: users.status,
  });

  return success(c, { user: updated }, 'Profil berhasil diperbarui');
});

router.patch('/change-password', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  const valid = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!valid) return forbidden(c, 'Password saat ini salah');

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await tx
      .update(refreshTokens)
      .set({ revoked: true })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));
  });

  return success(c, null, 'Password berhasil diubah');
});

router.delete('/account', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = deleteAccountSchema.safeParse(body);

  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    );
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  const valid = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!valid) return forbidden(c, 'Password salah');

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ status: 'deleted', deletedAt: new Date() })
      .where(eq(users.id, userId));
    await tx
      .update(refreshTokens)
      .set({ revoked: true })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));
  });

  clearAuthCookies(c);
  return success(c, null, 'Akun berhasil dihapus');
});

export { router as authRouter };
