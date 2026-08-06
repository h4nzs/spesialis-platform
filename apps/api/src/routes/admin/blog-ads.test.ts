import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminBlogAdsRouter } from './blog-ads.ts';
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
  app.route('/api/v1/admin/blog-ads', adminBlogAdsRouter);
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

const adId = '00000000-0000-0000-0000-000000000001';

const sampleAd = {
  id: adId,
  title: 'Jasa AC Murah',
  imageUrl: 'https://example.com/ac-ad.jpg',
  caption: 'Dapatkan diskon 20% untuk layanan AC',
  linkUrl: 'https://ahlipanggilan.id/services/ac-service',
  displayOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

describe('GET /api/v1/admin/blog-ads', () => {
  it('200 list all ads', async () => {
    mockDb.select.mockReturnValue(makeChain([sampleAd]));

    const res = await mkApp().request('/api/v1/admin/blog-ads', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Jasa AC Murah');
  });

  it('200 empty list', async () => {
    mockDb.select.mockReturnValue(makeChain([]));

    const res = await mkApp().request('/api/v1/admin/blog-ads', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/blog-ads');
    expect(res.status).toBe(401);
  });

  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/blog-ads', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('403 for partner', async () => {
    const res = await mkApp('partner').request('/api/v1/admin/blog-ads', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('200 for content_manager', async () => {
    mockDb.select.mockReturnValue(makeChain([sampleAd]));
    const res = await mkApp('content_manager').request('/api/v1/admin/blog-ads', {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('200 for super_admin', async () => {
    mockDb.select.mockReturnValue(makeChain([sampleAd]));
    const res = await mkApp('super_admin').request('/api/v1/admin/blog-ads', {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/admin/blog-ads/:id', () => {
  it('200 detail', async () => {
    mockDb.select.mockReturnValue(makeChain([sampleAd]));
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      headers: a(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Jasa AC Murah');
    expect(body.data.imageUrl).toBe('https://example.com/ac-ad.jpg');
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/admin/blog-ads', () => {
  it('201 created', async () => {
    mockDb.insert.mockReturnValue(
      insertChain([
        { id: adId, title: 'Iklan Baru', imageUrl: 'https://example.com/img.jpg', caption: 'Test' },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/blog-ads', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: 'Iklan Baru', imageUrl: 'https://example.com/img.jpg' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.title).toBe('Iklan Baru');
  });

  it('422 on missing required fields', async () => {
    const res = await mkApp().request('/api/v1/admin/blog-ads', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: '' }),
    });
    expect(res.status).toBe(422);
  });

  it('422 on missing imageUrl', async () => {
    const res = await mkApp().request('/api/v1/admin/blog-ads', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: 'Iklan Test' }),
    });
    expect(res.status).toBe(422);
  });

  it('201 with all optional fields', async () => {
    mockDb.insert.mockReturnValue(
      insertChain([
        {
          id: adId,
          title: 'Iklan Lengkap',
          imageUrl: 'https://example.com/img.jpg',
          caption: 'Diskon besar-besaran',
          linkUrl: 'https://ahlipanggilan.id/promo',
          displayOrder: 5,
          isActive: true,
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/blog-ads', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        title: 'Iklan Lengkap',
        imageUrl: 'https://example.com/img.jpg',
        caption: 'Diskon besar-besaran',
        linkUrl: 'https://ahlipanggilan.id/promo',
        displayOrder: 5,
        isActive: true,
      }),
    });
    expect(res.status).toBe(201);
  });

  it('403 for customer trying to create', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/blog-ads', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: 'X', imageUrl: 'https://x.com/x.jpg' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/v1/admin/blog-ads/:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: adId }]));
    mockDb.update.mockReturnValue(
      updateChain([
        { id: adId, title: 'Updated', imageUrl: 'https://x.com/x.jpg', caption: 'Updated caption' },
      ]),
    );
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ title: 'Updated', caption: 'Updated caption' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Updated');
  });

  it('200 update displayOrder only', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: adId }]));
    mockDb.update.mockReturnValue(
      updateChain([{ id: adId, title: 'Same', imageUrl: 'https://x.com/x.jpg', displayOrder: 10 }]),
    );
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ displayOrder: 10 }),
    });
    expect(res.status).toBe(200);
  });

  it('200 toggle isActive to false', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: adId }]));
    mockDb.update.mockReturnValue(
      updateChain([{ id: adId, title: 'Same', imageUrl: 'https://x.com/x.jpg', isActive: false }]),
    );
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ isActive: false }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ title: 'Q' }),
    });
    expect(res.status).toBe(404);
  });

  it('403 for partner trying to update', async () => {
    const res = await mkApp('partner').request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ title: 'X' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/admin/blog-ads/:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: adId }]));
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });

  it('403 for content_manager (delete requires admin)', async () => {
    const res = await mkApp('content_manager').request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });

  it('200 for super_admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: adId }]));
    const res = await mkApp('super_admin').request(`/api/v1/admin/blog-ads/${adId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
});
