import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminTestimonialsRouter } from './testimonials.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../../test-utils.ts';

const mockRateLimit = vi.hoisted(() => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

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

vi.mock('../../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../../lib/auth.ts', () => ({
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'admin', exp: 9999999999 }),
  generateRefreshToken: vi.fn().mockReturnValue('r'),
  hashToken: vi.fn().mockReturnValue('h'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 86400000)),
}));
vi.mock('../../middleware/auth.ts', () => ({
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
vi.mock('../../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../../middleware/rate-limiter.ts', () => mockRateLimit);

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/testimonials', adminTestimonialsRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

const testimonialId = '00000000-0000-0000-0000-000000000001';

const sampleTestimonial = {
  id: testimonialId,
  name: 'Rina Wijaya',
  location: 'Jakarta Selatan',
  role: null,
  quote: 'Teknisinya datang tepat waktu, pekerjaan rapi, dan harga sesuai estimasi.',
  rating: '5',
  avatar: null,
  displayOrder: 0,
  isActive: 'true',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

describe('GET /api/v1/admin/testimonials', () => {
  it('200 list with pagination', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([sampleTestimonial]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: '1' }]));

    const res = await mkApp().request('/api/v1/admin/testimonials', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination).toBeDefined();
    expect(body.data[0].name).toBe('Rina Wijaya');
  });

  it('200 empty list', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: '0' }]));

    const res = await mkApp().request('/api/v1/admin/testimonials', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/testimonials');
    expect(res.status).toBe(401);
  });

  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/testimonials', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('200 for content_manager', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([sampleTestimonial]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: '1' }]));
    const res = await mkApp('content_manager').request('/api/v1/admin/testimonials', {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('200 for super_admin', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([sampleTestimonial]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: '1' }]));
    const res = await mkApp('super_admin').request('/api/v1/admin/testimonials', {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/admin/testimonials/:id', () => {
  it('200 detail', async () => {
    mockDb.select.mockReturnValue(makeChain([sampleTestimonial]));
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      headers: a(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('Rina Wijaya');
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/admin/testimonials', () => {
  it('201 created', async () => {
    mockDb.insert.mockReturnValue(
      insertChain([{ id: testimonialId, name: 'Test', quote: 'Great!', rating: '5' }]),
    );
    const res = await mkApp().request('/api/v1/admin/testimonials', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'Test', quote: 'Great!' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe('Test');
  });

  it('422 on missing required fields', async () => {
    const res = await mkApp().request('/api/v1/admin/testimonials', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: '' }),
    });
    expect(res.status).toBe(422);
  });

  it('201 with optional fields', async () => {
    mockDb.insert.mockReturnValue(
      insertChain([
        {
          id: testimonialId,
          name: 'Bambang',
          location: 'Bandung',
          role: 'Teknisi AC',
          quote: 'Mantap!',
          rating: '4',
          displayOrder: 1,
          isActive: 'true',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/testimonials', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        name: 'Bambang',
        location: 'Bandung',
        role: 'Teknisi AC',
        quote: 'Mantap!',
        rating: 4,
        displayOrder: 1,
        isActive: 'true',
      }),
    });
    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/v1/admin/testimonials/:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: testimonialId }]));
    mockDb.update.mockReturnValue(
      updateChain([{ id: testimonialId, name: 'Updated', quote: 'Updated!', rating: '5' }]),
    );
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated', quote: 'Updated!' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('Updated');
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Q' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/admin/testimonials/:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: testimonialId }]));
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/testimonials/${testimonialId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });

  it('403 for content_manager (delete requires admin)', async () => {
    const res = await mkApp('content_manager').request(
      `/api/v1/admin/testimonials/${testimonialId}`,
      { method: 'DELETE', headers: a() },
    );
    expect(res.status).toBe(403);
  });

  it('200 for super_admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: testimonialId }]));
    const res = await mkApp('super_admin').request(`/api/v1/admin/testimonials/${testimonialId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
});
