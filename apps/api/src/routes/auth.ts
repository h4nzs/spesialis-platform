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
import { validateBody } from '../middleware/validation.ts';
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
  refreshTokenSchema,
  verifyEmailSchema,
} from '@specialist/validation';
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
  ConvertGuestInput,
  RefreshTokenInput,
  VerifyEmailInput,
} from '@specialist/validation';
import { parseBody } from '../lib/parse-body.ts';
import { omitUndefined } from '../lib/update.ts';
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

router.post('/register', rateLimit(10, 60_000), validateBody(registerSchema), async (c) => {
  const { email, phone, password, fullName } = c.get('validated') as RegisterInput;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.phone, phone)))
    .limit(1);

  if (existing[0]) {
    return conflict(c, 'Email atau nomor HP sudah terdaftar');
  }

  const passwordHash = await hashPassword(password);

  const { user, token, verificationToken } = await db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        email,
        phone,
        passwordHash,
        role: 'customer',
        status: 'active',
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    if (!createdUser) throw new Error('Gagal membuat user');

    await tx.insert(customerProfiles).values({
      userId: createdUser.id,
      fullName,
    });

    const jwtToken = await signAccessToken(createdUser.id, createdUser.email, createdUser.role);

    const vt = generateRefreshToken();
    await tx.insert(passwordResets).values({
      userId: createdUser.id,
      tokenHash: hashToken(vt),
      expiresAt: getRefreshTokenExpiry(),
    });

    return { user: createdUser, token: jwtToken, verificationToken: vt };
  });

  sendVerificationEmail(email, fullName, verificationToken);

  setAuthCookies(c, token);
  return created(c, { user: { id: user.id, email: user.email, role: user.role }, token });
});

router.post(
  '/convert-guest',
  rateLimit(10, 60_000),
  validateBody(convertGuestSchema),
  async (c) => {
    const { phone, email, password, fullName } = c.get('validated') as ConvertGuestInput;

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
      .where(and(eq(customerProfiles.guestPhone, phone), isNull(customerProfiles.userId)))
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

    const token = await signAccessToken(user.id, user.email, user.role);

    setAuthCookies(c, token);
    return created(c, { user, token }, 'Akun berhasil dibuat');
  },
);

router.post('/login', rateLimit(10, 60_000), validateBody(loginSchema), async (c) => {
  const { email, password } = c.get('validated') as LoginInput;

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

  const token = await signAccessToken(user.id, user.email, user.role);

  setAuthCookies(c, token, refreshToken);
  return success(c, {
    user: { id: user.id, email: user.email, role: user.role },
    token,
    refreshToken,
  });
});

router.post('/refresh', rateLimit(20, 60_000), validateBody(refreshTokenSchema), async (c) => {
  const { refreshToken } = c.get('validated') as RefreshTokenInput;

  const [stored] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      revoked: refreshTokens.revoked,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.tokenHash, hashToken(refreshToken)), eq(refreshTokens.revoked, false)),
    )
    .limit(1);

  if (!stored || stored.expiresAt < new Date()) {
    return unauthorized(c, 'Invalid or expired refresh token');
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role })
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

  const token = await signAccessToken(user.id, user.email, user.role);

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
  const parsed = await parseBody(c, forgotPasswordSchema);
  if (!parsed.ok) {
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

router.post(
  '/reset-password',
  rateLimit(5, 60_000),
  validateBody(resetPasswordSchema),
  async (c) => {
    const { token, password } = c.get('validated') as ResetPasswordInput;

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
      return error(
        c,
        'INVALID_RESET_TOKEN',
        'Token reset password tidak valid atau kadaluarsa',
        400,
      );
    }

    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, stored.userId));
      await tx.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, stored.id));
    });

    return success(c, null, 'Password berhasil direset');
  },
);

router.post('/verify-email', rateLimit(10, 60_000), validateBody(verifyEmailSchema), async (c) => {
  const { token } = c.get('validated') as VerifyEmailInput;

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

router.post('/resend-verification', authMiddleware, rateLimit(5, 60_000), async (c) => {
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

router.patch('/profile', authMiddleware, validateBody(updateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.get('validated') as UpdateProfileInput;

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  if (data.email !== undefined && data.email !== user.email) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, data.email), isNull(users.deletedAt)))
      .limit(1);
    if (existing) return conflict(c, 'Email sudah digunakan');
  }

  const updateData = omitUndefined({
    email: data.email,
    phone: data.phone,
  });

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

router.patch('/change-password', authMiddleware, validateBody(changePasswordSchema), async (c) => {
  const userId = c.get('userId');
  const { currentPassword, newPassword } = c.get('validated') as ChangePasswordInput;

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) return forbidden(c, 'Password saat ini salah');

  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await tx
      .update(refreshTokens)
      .set({ revoked: true })
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));
  });

  return success(c, null, 'Password berhasil diubah');
});

router.delete('/account', authMiddleware, validateBody(deleteAccountSchema), async (c) => {
  const userId = c.get('userId');
  const { password } = c.get('validated') as DeleteAccountInput;

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return notFound(c, 'User tidak ditemukan');

  const valid = await verifyPassword(user.passwordHash, password);
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
