import { Hono } from 'hono';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  db,
  users,
  partnerProfiles,
  partnerSkills,
  partnerDocuments,
  serviceCategories,
  serviceSuggestions,
  assignments,
  orders,
  reviews,
  partnerPenalties,
  passwordResets,
} from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { validateBody, validateQuery } from '../middleware/validation.ts';
import {
  hashPassword,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '../lib/auth.ts';
import {
  partnerRegistrationSchema,
  updatePartnerSchema,
  updateAvailabilitySchema,
  verifyPartnerSchema,
  addSkillSchema,
  replacePartnerSkillsSchema,
  createPartnerDocumentSchema,
  paginationQuerySchema,
} from '@ahlipanggilan/validation';
import type {
  PartnerRegistrationInput,
  UpdatePartnerInput,
  UpdateAvailabilityInput,
  AddSkillInput,
  CreatePartnerDocumentInput,
  VerifyPartnerInput,
} from '@ahlipanggilan/validation';
import type { PartnerAvailability, PartnerVerificationStatus } from '@ahlipanggilan/types';
import {
  success,
  successPaginated,
  created,
  notFound,
  conflict,
  serverError,
} from '../lib/response.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { omitUndefined } from '../lib/update.ts';
import { sendPartnerVerifiedEmail, sendVerificationEmail } from '../lib/email.ts';
import { createNotification, notifyAdmins } from '../lib/notification.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';

const router = new Hono();

async function listPartnerJobs(partnerId: string) {
  return await db
    .select({
      id: assignments.id,
      orderId: assignments.orderId,
      status: assignments.status,
      assignedAt: assignments.assignedAt,
      acceptedAt: assignments.acceptedAt,
      completedAt: assignments.completedAt,
      orderStatus: orders.status,
      bookingNumber: orders.bookingNumber,
    })
    .from(assignments)
    .innerJoin(orders, eq(assignments.orderId, orders.id))
    .where(eq(assignments.partnerId, partnerId))
    .orderBy(desc(assignments.assignedAt));
}

router.post(
  '/register',
  rateLimit(5, 60_000),
  validateBody(partnerRegistrationSchema),
  async (c) => {
    const {
      email,
      phone,
      password,
      fullName,
      ktpNumber,
      domicile,
      skillIds,
      suggestedServiceName,
      suggestedServiceDescription,
    } = c.get('validated') as PartnerRegistrationInput;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing[0]) return conflict(c, 'Email sudah terdaftar');

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        phone,
        passwordHash,
        role: 'partner',
        status: 'active',
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    if (!user) return serverError(c, 'Gagal membuat user');

    const [profile] = await db
      .insert(partnerProfiles)
      .values({
        userId: user.id,
        fullName,
        phone,
        ktpNumber,
        domicile: domicile ?? null,
      })
      .returning({ id: partnerProfiles.id });

    // Insert partner skills if provided
    if (skillIds && skillIds.length > 0 && profile) {
      await db.insert(partnerSkills).values(
        skillIds.map((categoryId) => ({
          partnerId: profile.id,
          categoryId,
          proficiency: 'Intermediate',
        })),
      );
    }

    // Simpan usulan layanan baru ke database + notifikasi admin
    if (suggestedServiceName) {
      try {
        await db.insert(serviceSuggestions).values({
          partnerName: fullName,
          partnerEmail: email,
          serviceName: suggestedServiceName,
          description: suggestedServiceDescription ?? null,
          status: 'pending',
        });
      } catch {
        // silent — jangan sampai gagal menyimpan suggestion menggagalkan registrasi
      }

      notifyAdmins(
        'partner.suggested_service',
        'Usulan Layanan Baru dari Mitra',
        `Mitra ${fullName} (${email}) mengusulkan layanan baru: ${suggestedServiceName}${suggestedServiceDescription ? ` — ${suggestedServiceDescription}` : ''}`,
      );
    }

    // Generate verification token & send email (fire-and-forget)
    const verificationToken = generateRefreshToken();
    await db.insert(passwordResets).values({
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: getRefreshTokenExpiry(),
    });
    sendVerificationEmail(email, fullName, verificationToken);

    notifyAdmins(
      'partner.registered',
      'Partner Baru',
      `Mitra baru mendaftar: ${fullName} (${email})`,
    );

    return created(c, { user }, 'Registrasi partner berhasil');
  },
);

router.get('/', validateQuery(paginationQuerySchema), async (c) => {
  const query = c.get('validated') as { page: number; limit: number };

  const availability = c.req.query('availability');
  const verification = c.req.query('verification');
  const categoryId = c.req.query('categoryId');

  const conditions: ReturnType<typeof eq>[] = [];
  if (availability)
    conditions.push(eq(partnerProfiles.availability, availability as PartnerAvailability));
  if (verification)
    conditions.push(
      eq(partnerProfiles.verificationStatus, verification as PartnerVerificationStatus),
    );
  if (categoryId) {
    const partnerIds = await db
      .select({ id: partnerSkills.partnerId })
      .from(partnerSkills)
      .where(eq(partnerSkills.categoryId, categoryId));
    conditions.push(eq(partnerProfiles.id, sql`ANY(${partnerIds.map((p) => p.id)})`));
  }

  const items = await db
    .select({
      id: partnerProfiles.id,
      fullName: partnerProfiles.fullName,
      avatar: partnerProfiles.avatar,
      ratingAverage: partnerProfiles.ratingAverage,
      completedJobs: partnerProfiles.completedJobs,
      availability: partnerProfiles.availability,
      verificationStatus: partnerProfiles.verificationStatus,
      experienceYear: partnerProfiles.experienceYear,
      bio: partnerProfiles.bio,
      domicile: partnerProfiles.domicile,
    })
    .from(partnerProfiles)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(partnerProfiles.ratingAverage))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(partnerProfiles)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(query.page, query.limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select()
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);

  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');
  return success(c, profile);
});

router.patch('/me', authMiddleware, validateBody(updatePartnerSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.get('validated') as UpdatePartnerInput;

  const [updated] = await db
    .update(partnerProfiles)
    .set(omitUndefined(data))
    .where(eq(partnerProfiles.userId, userId))
    .returning({
      id: partnerProfiles.id,
      fullName: partnerProfiles.fullName,
      phone: partnerProfiles.phone,
      bio: partnerProfiles.bio,
      experienceYear: partnerProfiles.experienceYear,
    });

  if (!updated) return serverError(c, 'Gagal update profil');
  return success(c, updated, 'Profil berhasil diperbarui');
});

router.patch(
  '/me/availability',
  authMiddleware,
  validateBody(updateAvailabilitySchema),
  async (c) => {
    const userId = c.get('userId');
    const { availability } = c.get('validated') as UpdateAvailabilityInput;

    const [updated] = await db
      .update(partnerProfiles)
      .set({ availability: availability as PartnerAvailability })
      .where(eq(partnerProfiles.userId, userId))
      .returning({ availability: partnerProfiles.availability });

    if (!updated) return serverError(c, 'Gagal update availability');
    return success(c, updated, 'Status berhasil diperbarui');
  },
);

router.get('/me/skills', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const items = await db
    .select({
      id: partnerSkills.id,
      categoryId: partnerSkills.categoryId,
      categoryName: serviceCategories.name,
      proficiency: partnerSkills.proficiency,
      createdAt: partnerSkills.createdAt,
    })
    .from(partnerSkills)
    .innerJoin(serviceCategories, eq(partnerSkills.categoryId, serviceCategories.id))
    .where(eq(partnerSkills.partnerId, profile.id));

  return success(c, items);
});

router.post('/me/skills', authMiddleware, validateBody(addSkillSchema), async (c) => {
  const userId = c.get('userId');
  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const { categoryId, proficiency } = c.get('validated') as AddSkillInput;

  const existing = await db
    .select({ id: partnerSkills.id })
    .from(partnerSkills)
    .where(and(eq(partnerSkills.partnerId, profile.id), eq(partnerSkills.categoryId, categoryId)))
    .limit(1);
  if (existing[0]) return conflict(c, 'Skill sudah terdaftar');

  const [skill] = await db
    .insert(partnerSkills)
    .values({
      partnerId: profile.id,
      categoryId,
      proficiency: proficiency ?? 'Intermediate',
    })
    .returning();

  return created(c, skill, 'Skill berhasil ditambahkan');
});

router.delete('/me/skills/:skillId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const skillId = c.req.param('skillId')!;

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const [skill] = await db
    .select({ id: partnerSkills.id })
    .from(partnerSkills)
    .where(and(eq(partnerSkills.id, skillId), eq(partnerSkills.partnerId, profile.id)))
    .limit(1);
  if (!skill) return notFound(c, 'Skill tidak ditemukan');

  await db.delete(partnerSkills).where(eq(partnerSkills.id, skillId));
  return success(c, null, 'Skill berhasil dihapus');
});

router.get('/me/jobs', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const items = await listPartnerJobs(profile.id);
  return success(c, items);
});

router.get('/me/earnings', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  // Orders this partner completed with their final prices
  const earningsData = await db
    .select({
      id: orders.id,
      bookingNumber: orders.bookingNumber,
      status: orders.status,
      finalPrice: orders.finalPrice,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .where(and(eq(orders.partnerId, profile.id), eq(orders.status, 'Paid')))
    .orderBy(desc(orders.completedAt));

  const totalEarnings = earningsData.reduce((sum, o) => sum + Number(o.finalPrice ?? 0), 0);

  return success(c, {
    totalEarnings,
    paidCount: earningsData.length,
    recentEarnings: earningsData.slice(0, 20),
  });
});

router.get('/me/penalties', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const items = await db
    .select({
      id: partnerPenalties.id,
      orderId: partnerPenalties.orderId,
      type: partnerPenalties.type,
      amount: partnerPenalties.amount,
      reason: partnerPenalties.reason,
      status: partnerPenalties.status,
      imposedAt: partnerPenalties.imposedAt,
      resolvedAt: partnerPenalties.resolvedAt,
      notes: partnerPenalties.notes,
    })
    .from(partnerPenalties)
    .where(eq(partnerPenalties.partnerId, profile.id))
    .orderBy(desc(partnerPenalties.imposedAt));

  return success(c, items);
});

router.get('/me/documents', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const items = await db
    .select()
    .from(partnerDocuments)
    .where(eq(partnerDocuments.partnerId, profile.id))
    .orderBy(desc(partnerDocuments.createdAt));

  return success(c, items);
});

router.post(
  '/me/documents',
  authMiddleware,
  validateBody(createPartnerDocumentSchema),
  async (c) => {
    const userId = c.get('userId');
    const { type, mediaId, fileName } = c.get('validated') as CreatePartnerDocumentInput;

    const [profile] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, userId))
      .limit(1);
    if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

    const [doc] = await db
      .insert(partnerDocuments)
      .values({
        partnerId: profile.id,
        type,
        mediaId,
        fileName,
      })
      .returning();

    return created(c, doc, 'Dokumen berhasil diupload');
  },
);

router.delete('/me/documents/:documentId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const documentId = c.req.param('documentId')!;

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const [doc] = await db
    .select({ id: partnerDocuments.id })
    .from(partnerDocuments)
    .where(and(eq(partnerDocuments.id, documentId), eq(partnerDocuments.partnerId, profile.id)))
    .limit(1);
  if (!doc) return notFound(c, 'Dokumen tidak ditemukan');

  await db.delete(partnerDocuments).where(eq(partnerDocuments.id, documentId));
  return success(c, null, 'Dokumen berhasil dihapus');
});

router.get('/:id', async (c) => {
  const partnerId = c.req.param('id')!;

  const [profile] = await db
    .select({
      id: partnerProfiles.id,
      userId: partnerProfiles.userId,
      fullName: partnerProfiles.fullName,
      avatar: partnerProfiles.avatar,
      experienceYear: partnerProfiles.experienceYear,
      bio: partnerProfiles.bio,
      ratingAverage: partnerProfiles.ratingAverage,
      completedJobs: partnerProfiles.completedJobs,
      availability: partnerProfiles.availability,
      verificationStatus: partnerProfiles.verificationStatus,
      createdAt: partnerProfiles.createdAt,
    })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.id, partnerId))
    .limit(1);

  if (!profile) return notFound(c, 'Partner tidak ditemukan');

  const skills = await db
    .select({
      id: partnerSkills.id,
      categoryId: partnerSkills.categoryId,
      categoryName: serviceCategories.name,
      proficiency: partnerSkills.proficiency,
    })
    .from(partnerSkills)
    .innerJoin(serviceCategories, eq(partnerSkills.categoryId, serviceCategories.id))
    .where(eq(partnerSkills.partnerId, partnerId));

  return success(c, { ...profile, skills });
});

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updatePartnerSchema),
  async (c) => {
    const partnerId = c.req.param('id')!;
    const data = c.get('validated') as UpdatePartnerInput;

    const [profile] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId))
      .limit(1);
    if (!profile) return notFound(c, 'Partner tidak ditemukan');

    const [updated] = await db
      .update(partnerProfiles)
      .set(omitUndefined(data))
      .where(eq(partnerProfiles.id, partnerId))
      .returning({
        id: partnerProfiles.id,
        fullName: partnerProfiles.fullName,
        phone: partnerProfiles.phone,
        domicile: partnerProfiles.domicile,
        bio: partnerProfiles.bio,
        experienceYear: partnerProfiles.experienceYear,
      });

    if (!updated) return serverError(c, 'Gagal update partner');
    return success(c, updated, 'Partner berhasil diperbarui');
  },
);

router.patch(
  '/:id/skills',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(replacePartnerSkillsSchema),
  async (c) => {
    const partnerId = c.req.param('id')!;
    const { skillIds } = c.get('validated') as { skillIds: string[] };

    const [profile] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId))
      .limit(1);
    if (!profile) return notFound(c, 'Partner tidak ditemukan');

    // Replace all skills in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(partnerSkills).where(eq(partnerSkills.partnerId, partnerId));
      if (skillIds.length > 0) {
        await tx.insert(partnerSkills).values(
          skillIds.map((categoryId) => ({
            partnerId,
            categoryId,
            proficiency: 'Intermediate',
          })),
        );
      }
    });

    return success(c, null, 'Skill berhasil diperbarui');
  },
);

router.get('/:id/reviews', async (c) => {
  const partnerId = c.req.param('id')!;

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.id, partnerId))
    .limit(1);
  if (!profile) return notFound(c, 'Partner tidak ditemukan');

  const items = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.review,
      review: reviews.review,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.partnerId, partnerId))
    .orderBy(desc(reviews.createdAt));

  return success(c, items);
});

router.post(
  '/:id/verify',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(verifyPartnerSchema),
  async (c) => {
    const partnerId = c.req.param('id')!;
    const data = c.get('validated') as VerifyPartnerInput;

    const [profile] = await db
      .select({ id: partnerProfiles.id, verificationStatus: partnerProfiles.verificationStatus })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId))
      .limit(1);
    if (!profile) return notFound(c, 'Partner tidak ditemukan');

    await db
      .update(partnerProfiles)
      .set({ verificationStatus: data.verificationStatus as PartnerVerificationStatus })
      .where(eq(partnerProfiles.id, partnerId));

    const [partnerUser] = await db
      .select({ email: users.email, fullName: partnerProfiles.fullName, userId: users.id })
      .from(partnerProfiles)
      .innerJoin(users, eq(users.id, partnerProfiles.userId))
      .where(eq(partnerProfiles.id, partnerId))
      .limit(1);

    if (partnerUser?.userId) {
      await createNotification({
        userId: partnerUser.userId,
        type: 'partner.verified',
        title:
          data.verificationStatus === 'Approved' ? 'Verifikasi Disetujui' : 'Verifikasi Ditolak',
        message:
          data.verificationStatus === 'Approved'
            ? 'Selamat! Akun mitra Anda telah diverifikasi.'
            : `Verifikasi akun mitra Anda ditolak. Alasan: ${data.note ?? 'tidak ada'}`,
      });
    }

    if (partnerUser?.email) {
      sendPartnerVerifiedEmail(
        partnerUser.email,
        partnerUser.fullName,
        data.verificationStatus as 'Approved' | 'Rejected',
        data.note ?? null,
      );
    }

    return success(
      c,
      { id: partnerId, verificationStatus: data.verificationStatus },
      `Partner ${data.verificationStatus === 'Approved' ? 'disetujui' : 'ditolak'}`,
    );
  },
);

router.get('/:id/jobs', async (c) => {
  const partnerId = c.req.param('id')!;

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.id, partnerId))
    .limit(1);
  if (!profile) return notFound(c, 'Partner tidak ditemukan');

  const items = await listPartnerJobs(partnerId);

  return success(c, items);
});

export { router as partnersRouter };
