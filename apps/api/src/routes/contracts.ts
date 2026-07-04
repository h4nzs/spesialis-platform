import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, contracts, companies, companyUsers } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import {
  createContractSchema,
  updateContractSchema,
  updateContractStatusSchema,
} from '@specialist/validation';
import type { PaginationMeta } from '@specialist/types';
import { success, successPaginated, created, error, notFound, forbidden } from '../lib/response.ts';
import { createAuditLog } from '../lib/audit.ts';

const router = new Hono();

router.use('*', authMiddleware);

async function getContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CT-${year}-`;
  const result = await db.execute(sql`
    SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number, 9) AS INTEGER)), 0) + 1 AS next
    FROM contracts WHERE contract_number LIKE ${prefix + '%'}
  `);
  const row = result[0] as { next: number } | undefined;
  const next = Number(row?.next ?? 1);
  return `${prefix}${String(next).padStart(4, '0')}`;
}

router.get('/', requireRole('admin', 'super_admin'), async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const companyId = c.req.query('companyId');
  const status = c.req.query('status');

  const conditions: ReturnType<typeof eq>[] = [];
  if (companyId) conditions.push(eq(contracts.companyId, companyId));
  if (status) conditions.push(eq(contracts.status, status));

  const items = await db
    .select()
    .from(contracts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contracts.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contracts)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return successPaginated(c, items, pagination);
});

router.get('/:id', async (c) => {
  const contractId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId)).limit(1);
  if (!contract) return notFound(c, 'Kontrak tidak ditemukan');

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(and(eq(companyUsers.companyId, contract.companyId), eq(companyUsers.userId, userId)))
      .limit(1);
    if (!cu) return forbidden(c);
  }

  return success(c, contract);
});

router.post('/', requireRole('admin', 'super_admin'), async (c) => {
  const body = await c.req.json();
  const parsed = createContractSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, parsed.data.companyId))
    .limit(1);
  if (!company) return error(c, 'COMPANY_NOT_FOUND', 'Perusahaan tidak ditemukan', 404);

  const contractNumber = await getContractNumber();
  const userId = c.get('userId');

  const [contract] = await db
    .insert(contracts)
    .values({
      ...parsed.data,
      contractNumber,
      slaResponseHours: parsed.data.slaResponseHours ?? null,
      slaResolutionHours: parsed.data.slaResolutionHours ?? null,
      discountPercent:
        parsed.data.discountPercent !== undefined && parsed.data.discountPercent !== null
          ? String(parsed.data.discountPercent)
          : null,
      discountAmount:
        parsed.data.discountAmount !== undefined && parsed.data.discountAmount !== null
          ? String(parsed.data.discountAmount)
          : null,
      createdBy: userId,
    })
    .returning();

  await createAuditLog(c, {
    userId,
    action: 'contract.create',
    entity: 'contract',
    entityId: contract!.id,
    newValue: { contractNumber },
    oldValue: null,
  });

  return created(c, contract, 'Kontrak berhasil dibuat');
});

router.patch('/:id', requireRole('admin', 'super_admin'), async (c) => {
  const contractId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updateContractSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [existing] = await db
    .select({ id: contracts.id, status: contracts.status })
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);
  if (!existing) return notFound(c, 'Kontrak tidak ditemukan');

  const updateData: Record<string, unknown> = { ...parsed.data, updatedBy: userId };
  if (parsed.data.discountPercent !== undefined) {
    updateData.discountPercent =
      parsed.data.discountPercent !== null ? String(parsed.data.discountPercent) : null;
  }
  if (parsed.data.discountAmount !== undefined) {
    updateData.discountAmount =
      parsed.data.discountAmount !== null ? String(parsed.data.discountAmount) : null;
  }

  const [updated] = await db
    .update(contracts)
    .set(updateData)
    .where(eq(contracts.id, contractId))
    .returning();

  await createAuditLog(c, {
    userId,
    action: 'contract.update',
    entity: 'contract',
    entityId: contractId,
    newValue: parsed.data,
    oldValue: { status: existing.status },
  });

  return success(c, updated, 'Kontrak berhasil diperbarui');
});

router.patch('/:id/status', requireRole('admin', 'super_admin'), async (c) => {
  const contractId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updateContractStatusSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [existing] = await db
    .select({ id: contracts.id, status: contracts.status })
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);
  if (!existing) return notFound(c, 'Kontrak tidak ditemukan');

  const [updated] = await db
    .update(contracts)
    .set({ status: parsed.data.status, updatedBy: userId })
    .where(eq(contracts.id, contractId))
    .returning();

  await createAuditLog(c, {
    userId,
    action: 'contract.status',
    entity: 'contract',
    entityId: contractId,
    newValue: { status: parsed.data.status },
    oldValue: { status: existing.status },
  });

  return success(c, updated, `Status kontrak diubah ke ${parsed.data.status}`);
});

export { router as contractsRouter };
