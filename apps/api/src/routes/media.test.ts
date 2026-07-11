import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { mediaRouter } from './media.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain } from '../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'customer' };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

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
}));

vi.mock('../lib/storage.ts', () => ({
  saveFile: vi.fn().mockResolvedValue({
    path: 'uploads/test.jpg',
    filename: 'test.jpg',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 1024,
  }),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  isAllowedMimeType: vi.fn().mockReturnValue(true),
  isWithinSizeLimit: vi.fn().mockReturnValue(true),
  UPLOAD_DIR: '/tmp/uploads',
}));

const UUID = '550e8400-e29b-41d4-a716-446655440000';

function a() {
  return { Authorization: 'Bearer x' };
}

function mkApp() {
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/media', mediaRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
});

describe('POST /upload', () => {
  it('201 uploaded', async () => {
    mockDb.insert.mockReturnValueOnce(
      insertChain([
        {
          id: UUID,
          filename: 'test.jpg',
          mimeType: 'image/jpeg',
          extension: 'jpg',
          size: 1024,
          createdAt: new Date().toISOString(),
        },
      ]),
    );
    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg');
    const res = await mkApp().request('/api/v1/media/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer x' },
      body: formData,
    });
    expect(res.status).toBe(201);
  });

  it('400 no file', async () => {
    const res = await mkApp().request('/api/v1/media/upload', {
      method: 'POST',
      headers: a(),
    });
    expect(res.status).toBe(400);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request('/api/v1/media/upload', { method: 'POST' });
    expect(res.status).toBe(401);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: UUID, filename: 'test.jpg', mimeType: 'image/jpeg', extension: 'jpg', size: 1024 },
      ]),
    );
    const res = await mkApp().request(`/api/v1/media/${UUID}`, { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(`/api/v1/media/${UUID}`, { headers: a() });
    expect(res.status).toBe(404);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request(`/api/v1/media/${UUID}`);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: UUID, path: 'test.jpg', uploadedBy: 'uid' }]),
    );
    const res = await mkApp().request(`/api/v1/media/${UUID}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(`/api/v1/media/${UUID}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });

  it('403 other user media', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: UUID, path: 'test.jpg', uploadedBy: 'other-uid' }]),
    );
    const res = await mkApp().request(`/api/v1/media/${UUID}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request(`/api/v1/media/${UUID}`, { method: 'DELETE' });
    expect(res.status).toBe(401);
  });
});
