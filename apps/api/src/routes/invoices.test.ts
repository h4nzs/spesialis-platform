import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { invoicesRouter } from './invoices.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain, insertChain } from '../test-utils.ts';

const { mockDb, authState, mockAudit, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'admin' };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../middleware/auth.ts', () => ({
  authMiddleware: async (c: Context, next: () => Promise<void>) => {
    if (!c.req.header('Authorization')) {
      c.status(401);
      return c.json({ success: false, code: 'UNAUTHORIZED', message: 'No token' });
    }
    c.set('userId', authState.userId);
    c.set('userRole', authState.userRole);
    await next();
  },
  requireRole:
    (...roles: string[]) =>
    async (c: Context, next: () => Promise<void>) => {
      if (!roles.includes(authState.userRole)) {
        c.status(403);
        return c.json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' });
      }
      await next();
    },
}));

const UUID = '550e8400-e29b-41d4-a716-446655440000';
function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/invoices', invoicesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
  mockDb.update.mockReset();
});

describe('GET /', () => {
  it('200 list all', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          {
            id: 'inv1',
            invoiceNumber: 'INV-2025-0001',
            companyId: 'cp1',
            amount: '500000',
            status: 'Draft',
          },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/invoices', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 filter by companyId', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'inv1' }]))
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/invoices?companyId=cp1', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 filter by status', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([])).mockReturnValueOnce(makeChain([{ count: 0 }]));
    const res = await mkApp().request('/api/v1/invoices?status=Draft', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 corporate sees own invoices', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ companyId: 'my-cp' }]))
      .mockReturnValueOnce(
        makeChain([{ id: 'inv1', companyId: 'my-cp', amount: '100000', status: 'Draft' }]),
      )
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp('corporate').request('/api/v1/invoices', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 corporate no company', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('corporate').request('/api/v1/invoices', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/invoices', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('GET /:id', () => {
  it('200 found admin', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'inv1', invoiceNumber: 'INV-2025-0001', companyId: 'cp1', amount: '500000' },
      ]),
    );
    const res = await mkApp().request('/api/v1/invoices/inv1', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 found corporate (own)', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          { id: 'inv1', invoiceNumber: 'INV-2025-0001', companyId: 'cp1', amount: '500000' },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ id: 'cu1' }]));
    const res = await mkApp('corporate').request('/api/v1/invoices/inv1', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 corporate not member', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          { id: 'inv1', invoiceNumber: 'INV-2025-0001', companyId: 'cp1', amount: '500000' },
        ]),
      )
      .mockReturnValueOnce(makeChain([]));
    const res = await mkApp('corporate').request('/api/v1/invoices/inv1', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/invoices/inv1', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(makeChain([]));
    mockDb.execute.mockResolvedValue([{ next: 1 }]);
    mockDb.insert.mockReturnValueOnce(
      insertChain([
        { id: 'inv1', invoiceNumber: 'INV-2025-0001', companyId: 'cp1', amount: '500000' },
      ]),
    );
    const res = await mkApp().request('/api/v1/invoices', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ companyId: UUID, amount: 500000, dueDate: '2025-06-30' }),
    });
    expect(res.status).toBe(201);
  });

  it('404 company not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/invoices', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ companyId: UUID, amount: 500000, dueDate: '2025-06-30' }),
    });
    expect(res.status).toBe(404);
  });

  it('404 order not found', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/invoices', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        companyId: UUID,
        amount: 500000,
        orderId: UUID,
        dueDate: '2025-06-30',
      }),
    });
    expect(res.status).toBe(404);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/invoices', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/invoices', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ companyId: UUID, amount: 500000, dueDate: '2025-06-30' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /:id/status', () => {
  it('200 status changed to Issued', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'inv1', status: 'Draft' }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'inv1', status: 'Issued' }]));
    const res = await mkApp().request('/api/v1/invoices/inv1/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Issued' }),
    });
    expect(res.status).toBe(200);
  });

  it('200 status changed to Paid', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'inv1', status: 'Draft' }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'inv1', status: 'Paid' }]));
    const res = await mkApp().request('/api/v1/invoices/inv1/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/invoices/inv1/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/invoices/inv1/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: '' }),
    });
    expect(res.status).toBe(422);
  });
});
