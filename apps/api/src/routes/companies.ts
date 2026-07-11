import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db, users, companies, companyUsers, branches } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import { hashPassword, signAccessToken } from '../lib/auth.ts';
import {
  createCompanySchema,
  updateCompanySchema,
  verifyCompanySchema,
  createBranchSchema,
  updateBranchSchema,
} from '@ahlipanggilan/validation';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  VerifyCompanyInput,
  CreateBranchInput,
  UpdateBranchInput,
} from '@ahlipanggilan/validation';
import { success, created, notFound, forbidden, conflict, serverError } from '../lib/response.ts';
import { omitUndefined } from '../lib/update.ts';
import { createAuditLog } from '../lib/audit.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';

const router = new Hono();

router.post('/', rateLimit(5, 60_000), validateBody(createCompanySchema), async (c) => {
  const { password, ...data } = c.get('validated') as CreateCompanyInput;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (existing[0]) return conflict(c, 'Email sudah terdaftar');

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: 'corporate',
      status: 'pending',
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!user) return serverError(c, 'Gagal membuat user');

  const [company] = await db
    .insert(companies)
    .values({
      companyName: data.companyName,
      legalName: data.legalName,
      email: data.email,
      phone: data.phone,
      taxNumber: data.taxNumber ?? null,
      logoMediaId: data.logoMediaId ?? null,
      website: data.website ?? null,
      industry: data.industry ?? null,
      employeeCount: data.employeeCount ?? null,
    })
    .returning();

  if (!company) return serverError(c, 'Gagal membuat perusahaan');

  await db.insert(companyUsers).values({
    companyId: company.id,
    userId: user.id,
    role: 'Owner',
  });

  const token = await signAccessToken(user.id, user.email, user.role);

  return created(
    c,
    { company, user: { id: user.id, email: user.email }, token },
    'Perusahaan berhasil didaftarkan',
  );
});

router.get('/', authMiddleware, requireRole('admin', 'super_admin', 'corporate'), async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ companyId: companyUsers.companyId })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userId))
      .limit(1);
    if (!cu) return notFound(c, 'Perusahaan tidak ditemukan');

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, cu.companyId))
      .limit(1);
    return success(c, company ? [company] : []);
  }

  const items = await db.select().from(companies).orderBy(desc(companies.createdAt));
  return success(c, items);
});

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [cu] = await db
    .select({ companyId: companyUsers.companyId })
    .from(companyUsers)
    .where(eq(companyUsers.userId, userId))
    .limit(1);
  if (!cu) return notFound(c, 'Perusahaan tidak ditemukan');

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, cu.companyId))
    .limit(1);
  if (!company) return notFound(c, 'Perusahaan tidak ditemukan');

  return success(c, company);
});

router.get('/:id', authMiddleware, async (c) => {
  const companyId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!company) return notFound(c, 'Perusahaan tidak ditemukan');

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
      .limit(1);
    if (!cu) return forbidden(c);
  }

  const branchList = await db
    .select()
    .from(branches)
    .where(eq(branches.companyId, companyId))
    .orderBy(branches.name);

  const userList = await db
    .select({
      id: companyUsers.id,
      userId: companyUsers.userId,
      role: companyUsers.role,
      email: users.email,
    })
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(eq(companyUsers.companyId, companyId));

  return success(c, { ...company, branches: branchList, users: userList });
});

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'corporate'),
  validateBody(updateCompanySchema),
  async (c) => {
    const companyId = c.req.param('id')!;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const data = c.get('validated') as UpdateCompanyInput;

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    if (!company) return notFound(c, 'Perusahaan tidak ditemukan');

    if (userRole === 'corporate') {
      const [cu] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
        .limit(1);
      if (!cu) return forbidden(c);
    }

    const [updated] = await db
      .update(companies)
      .set(omitUndefined(data))
      .where(eq(companies.id, companyId))
      .returning();

    return success(c, updated, 'Perusahaan berhasil diperbarui');
  },
);

router.post(
  '/:id/verify',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(verifyCompanySchema),
  async (c) => {
    const companyId = c.req.param('id')!;
    const data = c.get('validated') as VerifyCompanyInput;
    const newStatus = data.status;

    const [company] = await db
      .select({ id: companies.id, status: companies.status })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    if (!company) return notFound(c, 'Perusahaan tidak ditemukan');
    await db.update(companies).set({ status: newStatus }).where(eq(companies.id, companyId));

    await createAuditLog(c, {
      userId: c.get('userId'),
      action: 'company.verify',
      entity: 'company',
      entityId: companyId,
      newValue: { status: newStatus, ...(data.note !== undefined ? { note: data.note } : {}) },
      oldValue: { status: company.status },
    });

    if (newStatus === 'Verified') {
      const companyUsersList = await db
        .select({ userId: companyUsers.userId })
        .from(companyUsers)
        .where(eq(companyUsers.companyId, companyId));
      for (const cu of companyUsersList) {
        await db.update(users).set({ status: 'active' }).where(eq(users.id, cu.userId));
      }
    }

    return success(
      c,
      { id: companyId, status: newStatus },
      `Perusahaan ${newStatus === 'Verified' ? 'diverifikasi' : 'ditolak'}`,
    );
  },
);

const branchRouter = new Hono();

branchRouter.get('/', authMiddleware, async (c) => {
  const companyId = c.req.param('companyId')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  if (!company) return notFound(c, 'Perusahaan tidak ditemukan');

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
      .limit(1);
    if (!cu) return forbidden(c);
  }

  const items = await db
    .select()
    .from(branches)
    .where(eq(branches.companyId, companyId))
    .orderBy(branches.name);
  return success(c, items);
});

branchRouter.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'corporate'),
  validateBody(createBranchSchema),
  async (c) => {
    const companyId = c.req.param('companyId')!;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const data = c.get('validated') as CreateBranchInput;

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    if (!company) return notFound(c, 'Perusahaan tidak ditemukan');

    if (userRole === 'corporate') {
      const [cu] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
        .limit(1);
      if (!cu) return forbidden(c);
    }

    const [branch] = await db
      .insert(branches)
      .values({
        companyId,
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone ?? null,
      })
      .returning();

    return created(c, branch, 'Cabang berhasil ditambahkan');
  },
);

branchRouter.patch(
  '/:branchId',
  authMiddleware,
  requireRole('admin', 'super_admin', 'corporate'),
  validateBody(updateBranchSchema),
  async (c) => {
    const companyId = c.req.param('companyId')!;
    const branchId = c.req.param('branchId')!;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const data = c.get('validated') as UpdateBranchInput;

    const [branch] = await db
      .select()
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.companyId, companyId)))
      .limit(1);
    if (!branch) return notFound(c, 'Cabang tidak ditemukan');

    if (userRole === 'corporate') {
      const [cu] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
        .limit(1);
      if (!cu) return forbidden(c);
    }

    const [updated] = await db
      .update(branches)
      .set(omitUndefined(data))
      .where(eq(branches.id, branchId))
      .returning();

    return success(c, updated, 'Cabang berhasil diperbarui');
  },
);

branchRouter.delete(
  '/:branchId',
  authMiddleware,
  requireRole('admin', 'super_admin', 'corporate'),
  async (c) => {
    const companyId = c.req.param('companyId')!;
    const branchId = c.req.param('branchId')!;
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    const [branch] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.companyId, companyId)))
      .limit(1);
    if (!branch) return notFound(c, 'Cabang tidak ditemukan');

    if (userRole === 'corporate') {
      const [cu] = await db
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(and(eq(companyUsers.companyId, companyId), eq(companyUsers.userId, userId)))
        .limit(1);
      if (!cu) return forbidden(c);
    }

    await db.delete(branches).where(eq(branches.id, branchId));
    return success(c, null, 'Cabang berhasil dihapus');
  },
);

router.route('/:companyId/branches', branchRouter);

export { router as companiesRouter };
