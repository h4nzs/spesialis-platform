import { Hono } from 'hono';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  db,
  users,
  partnerProfiles,
  partnerSkills,
  serviceCategories,
  assignments,
  orders,
  reviews,
} from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { hashPassword } from '../lib/auth.ts';
import {
  partnerRegistrationSchema,
  updatePartnerSchema,
  updateAvailabilitySchema,
  verifyPartnerSchema,
  addSkillSchema,
  paginationQuerySchema,
} from '@specialist/validation';
import type {
  PaginationMeta,
  PartnerAvailability,
  PartnerVerificationStatus,
} from '@specialist/types';
import {
  success,
  successPaginated,
  created,
  error,
  notFound,
  conflict,
  serverError,
} from '../lib/response.ts';

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

router.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = partnerRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const { email, phone, password, fullName, ktpNumber } = parsed.data;

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

  await db.insert(partnerProfiles).values({
    userId: user.id,
    fullName,
    phone,
    ktpNumber,
  });

  return created(c, { user }, 'Registrasi partner berhasil');
});

router.get('/', async (c) => {
  const parsed = paginationQuerySchema.safeParse(c.req.query());
  if (!parsed.success) return error(c, 'VALIDATION_ERROR', 'Parameter tidak valid', 422);
  const query = parsed.data;

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
  const totalPages = Math.ceil(total / query.limit);

  const pagination: PaginationMeta = {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    hasNext: query.page < totalPages,
    hasPrev: query.page > 1,
  };

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

router.patch('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updatePartnerSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) updateData.fullName = parsed.data.fullName;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.experienceYear !== undefined)
    updateData.experienceYear = parsed.data.experienceYear;

  const [updated] = await db
    .update(partnerProfiles)
    .set(updateData)
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

router.patch('/me/availability', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updateAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [updated] = await db
    .update(partnerProfiles)
    .set({ availability: parsed.data.availability })
    .where(eq(partnerProfiles.userId, userId))
    .returning({ availability: partnerProfiles.availability });

  if (!updated) return serverError(c, 'Gagal update availability');
  return success(c, updated, 'Status berhasil diperbarui');
});

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

router.post('/me/skills', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return notFound(c, 'Profil partner tidak ditemukan');

  const body = await c.req.json();
  const parsed = addSkillSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const existing = await db
    .select({ id: partnerSkills.id })
    .from(partnerSkills)
    .where(
      and(
        eq(partnerSkills.partnerId, profile.id),
        eq(partnerSkills.categoryId, parsed.data.categoryId),
      ),
    )
    .limit(1);
  if (existing[0]) return conflict(c, 'Skill sudah terdaftar');

  const [skill] = await db
    .insert(partnerSkills)
    .values({
      partnerId: profile.id,
      categoryId: parsed.data.categoryId,
      proficiency: parsed.data.proficiency ?? 'Intermediate',
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

router.post('/:id/verify', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const partnerId = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = verifyPartnerSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [profile] = await db
    .select({ id: partnerProfiles.id, verificationStatus: partnerProfiles.verificationStatus })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.id, partnerId))
    .limit(1);
  if (!profile) return notFound(c, 'Partner tidak ditemukan');

  await db
    .update(partnerProfiles)
    .set({ verificationStatus: parsed.data.verificationStatus as PartnerVerificationStatus })
    .where(eq(partnerProfiles.id, partnerId));

  return success(
    c,
    { id: partnerId, verificationStatus: parsed.data.verificationStatus },
    `Partner ${parsed.data.verificationStatus === 'Approved' ? 'disetujui' : 'ditolak'}`,
  );
});

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
