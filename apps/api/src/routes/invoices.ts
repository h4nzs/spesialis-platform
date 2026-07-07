import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, invoices, companies, companyUsers, orders } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import { createInvoiceSchema, updateInvoiceStatusSchema } from '@specialist/validation';
import type { CreateInvoiceInput, UpdateInvoiceStatusInput } from '@specialist/validation';
import { success, successPaginated, created, error, notFound, forbidden } from '../lib/response.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { omitUndefined } from '../lib/update.ts';
import { createAuditLog } from '../lib/audit.ts';

const router = new Hono();

router.use('*', authMiddleware);

async function getInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const result = await db.execute(sql`
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, 10) AS INTEGER)), 0) + 1 AS next
    FROM invoices WHERE invoice_number LIKE ${prefix + '%'}
  `);
  const row = result[0] as { next: number } | undefined;
  const next = Number(row?.next ?? 1);
  return `${prefix}${String(next).padStart(4, '0')}`;
}

router.get('/', requireRole('admin', 'super_admin', 'corporate'), async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const companyId = c.req.query('companyId');
  const status = c.req.query('status');
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const conditions: ReturnType<typeof eq>[] = [];

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ companyId: companyUsers.companyId })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userId))
      .limit(1);
    if (cu) conditions.push(eq(invoices.companyId, cu.companyId));
    else return forbidden(c);
  } else {
    if (companyId) conditions.push(eq(invoices.companyId, companyId));
  }

  if (status) conditions.push(eq(invoices.status, status));

  const items = await db
    .select()
    .from(invoices)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(invoices.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/:id', async (c) => {
  const invoiceId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return notFound(c, 'Invoice tidak ditemukan');

  if (userRole === 'corporate') {
    const [cu] = await db
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(and(eq(companyUsers.companyId, invoice.companyId), eq(companyUsers.userId, userId)))
      .limit(1);
    if (!cu) return forbidden(c);
  }

  return success(c, invoice);
});

router.post(
  '/',
  requireRole('admin', 'super_admin'),
  validateBody(createInvoiceSchema),
  async (c) => {
    const data = c.get('validated') as CreateInvoiceInput;

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, data.companyId))
      .limit(1);
    if (!company) return error(c, 'COMPANY_NOT_FOUND', 'Perusahaan tidak ditemukan', 404);

    if (data.orderId) {
      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, data.orderId))
        .limit(1);
      if (!order) return error(c, 'ORDER_NOT_FOUND', 'Pesanan tidak ditemukan', 404);
    }

    const invoiceNumber = await getInvoiceNumber();
    const userId = c.get('userId');

    const [invoice] = await db
      .insert(invoices)
      .values({
        ...data,
        invoiceNumber,
        orderId: data.orderId ?? null,
        amount: String(data.amount),
        createdBy: userId,
      })
      .returning();

    await createAuditLog(c, {
      userId,
      action: 'invoice.create',
      entity: 'invoice',
      entityId: invoice!.id,
      newValue: { invoiceNumber, amount: data.amount },
      oldValue: null,
    });

    return created(c, invoice, 'Invoice berhasil dibuat');
  },
);

router.patch(
  '/:id/status',
  requireRole('admin', 'super_admin'),
  validateBody(updateInvoiceStatusSchema),
  async (c) => {
    const invoiceId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as UpdateInvoiceStatusInput;

    const [existing] = await db
      .select({ id: invoices.id, status: invoices.status })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    if (!existing) return notFound(c, 'Invoice tidak ditemukan');

    const [updated] = await db
      .update(invoices)
      .set({
        status: data.status,
        updatedBy: userId,
        ...(data.status === 'Issued' ? { issuedAt: new Date() } : {}),
        ...(data.status === 'Paid' ? { paidAt: new Date() } : {}),
        ...omitUndefined({ notes: data.notes }),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await createAuditLog(c, {
      userId,
      action: 'invoice.status',
      entity: 'invoice',
      entityId: invoiceId,
      newValue: { status: data.status },
      oldValue: { status: existing.status },
    });

    return success(c, updated, `Status invoice diubah ke ${data.status}`);
  },
);

export { router as invoicesRouter };
