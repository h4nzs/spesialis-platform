import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { bookingsRouter } from './bookings.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';

const { mockDb, authState, mockAudit, mockNotif, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st = { userId: 'uid', userRole: 'customer' };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const nx = { createNotification: vi.fn().mockResolvedValue(undefined) };
  const exps = (globalThis as any).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, mockNotif: nx, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/auth.ts', () => ({
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'customer', exp: 9999999999 }),
  generateRefreshToken: vi.fn().mockReturnValue('r'),
  hashToken: vi.fn().mockReturnValue('h'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 86400000)),
}));
vi.mock('../middleware/auth.ts', () => ({
  authMiddleware: async (c: any, next: any) => {
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
    async (c: any, next: any) => {
      if (!roles.includes(authState.userRole)) {
        c.status(403);
        return c.json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' });
      }
      await next();
    },
}));
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../lib/notification.ts', () => ({ ...mockNotif }));

function mkApp(role = 'customer') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/bookings', bookingsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
  mockDb.transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(mockDb));
});

const SERVICE_ID = '550e8400-e29b-41d4-a716-446655440001';
const ADDRESS_ID = '550e8400-e29b-41d4-a716-446655440002';
const PARTNER_USER_ID = '550e8400-e29b-41d4-a716-446655440003';

const GB = {
  fullName: 'G',
  phone: '08123456789',
  address: {
    receiverName: 'G',
    receiverPhone: '08123456789',
    province: 'J',
    city: 'J',
    district: 'G',
    postalCode: '10110',
    address: 'Jl. T',
  },
  bookingDate: '2026-07-15',
  bookingTime: '10:00',
  items: [{ serviceId: SERVICE_ID, quantity: 1 }],
};
const CB = {
  addressId: ADDRESS_ID,
  bookingDate: '2026-07-15',
  bookingTime: '10:00',
  items: [{ serviceId: SERVICE_ID, quantity: 1 }],
};

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

describe('POST / — guest', () => {
  it('201', async () => {
    mockDb.execute.mockResolvedValue([{ next: 1 }]);
    mockDb.select.mockReturnValue(makeChain([{ id: 's1', basePrice: '150000' }]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'p1' }]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'a1' }]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'o1' }]));
    mockDb.insert.mockReturnValue(insertChain([{ id: 'oi' }]));
    const res = await mkApp().request('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(GB),
    });
    expect(res.status).toBe(201);
  });
  it('422 empty', async () => {
    const res = await mkApp().request('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
  it('422 bad date', async () => {
    const res = await mkApp().request('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...GB, bookingDate: 'bad' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST / — customer', () => {
  it('201', async () => {
    mockDb.execute.mockResolvedValue([{ next: 1 }]);
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: ADDRESS_ID }]));
    mockDb.select.mockReturnValue(makeChain([{ id: 's1', name: 'AC', basePrice: '150000' }]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'o1' }]));
    mockDb.insert.mockReturnValue(insertChain([{ id: 'oi' }]));
    const res = await mkApp('customer').request('/api/v1/bookings', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(CB),
    });
    expect(res.status).toBe(201);
  });
  it('400 no profile', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(CB),
    });
    expect(res.status).toBe(400);
  });
  it('404 bad address', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(CB),
    });
    expect(res.status).toBe(404);
  });
});

describe('GET /', () => {
  it('200 customer', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('200 admin', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/bookings', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('401', async () => {
    const res = await mkApp().request('/api/v1/bookings');
    expect(res.status).toBe(401);
  });
});

describe('GET /tracking/:bn', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'o1',
          bookingNumber: 'SP-2026-000001',
          status: 'Pending',
          bookingDate: '2026-07-15',
          bookingTime: '10:00',
          basePrice: '150000',
          notes: null,
          createdAt: new Date(),
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(
      makeChain([{ fromStatus: null, toStatus: 'Pending', createdAt: new Date() }]),
    );
    const res = await mkApp().request('/api/v1/bookings/tracking/SP-2026-000001');
    expect(res.status).toBe(200);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/bookings/tracking/XX');
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/confirm', () => {
  it('200 admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'o1', status: 'Pending Confirmation' }]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ finalPrice: '150000' }),
    });
    expect(res.status).toBe(200);
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(403);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });
  it('409 bad transition', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'o1', status: 'Closed' }]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /:id/assign', () => {
  it('200 admin', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'o1', status: 'Waiting Assignment' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1', availability: 'Available' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pu', email: 'p@t.com' }]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/assign', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ partnerId: PARTNER_USER_ID }),
    });
    expect(res.status).toBe(200);
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/assign', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ partnerId: 'p' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /:id/accept', () => {
  it('200 partner', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Partner Assigned', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/accept', {
      method: 'POST',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
  it('403 customer', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/accept', {
      method: 'POST',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /:id/cancel', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Pending Confirmation', customerId: 'p1' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/cancel', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Change' }),
    });
    expect(res.status).toBe(200);
  });
  it('409 bad status', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Closed', customerId: 'p1' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/cancel', {
      method: 'POST',
      headers: a(),
    });
    expect(res.status).toBe(409);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/cancel', {
      method: 'POST',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});
