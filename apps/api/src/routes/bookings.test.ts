import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { bookingsRouter } from './bookings.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';
import type { ApiTestResponse } from '../test-utils.ts';

const mockRateLimit = vi.hoisted(() => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

const { mockDb, authState, mockAudit, mockNotif, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'customer' };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const nx = {
    createNotification: vi.fn().mockResolvedValue(undefined),
    notifyAdmins: vi.fn().mockResolvedValue(undefined),
  };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
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
vi.mock('../lib/email.ts', () => ({
  APP_URL: 'http://localhost:4321',
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendPartnerAssignedEmail: vi.fn().mockResolvedValue(undefined),
  sendPartnerVerifiedEmail: vi.fn().mockResolvedValue(undefined),
  sendPaymentVerifiedEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

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
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../lib/notification.ts', () => ({ ...mockNotif }));
vi.mock('../middleware/rate-limiter.ts', () => mockRateLimit);

function mkApp(role: UserRole = 'customer') {
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('422 empty', async () => {
    const res = await mkApp().request('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });
  it('422 bad date', async () => {
    const res = await mkApp().request('/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...GB, bookingDate: 'bad' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('400 no profile', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(CB),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });
  it('404 bad address', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(CB),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('GET /', () => {
  it('200 customer', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('200 admin', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/bookings', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it('401', async () => {
    const res = await mkApp().request('/api/v1/bookings');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/bookings/tracking/XX');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
  it('409 bad transition', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'o1', status: 'Closed' }]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it('500 transaction rollback when DB update fails', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'o1', status: 'Pending Confirmation' }]));
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    });
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ finalPrice: '150000' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it('200 still succeeds when email sending fails (non-critical)', async () => {
    const emailModule = await import('../lib/email.ts');
    vi.mocked(emailModule.sendBookingConfirmationEmail).mockRejectedValueOnce(
      new Error('SMTP error'),
    );
    mockDb.select.mockReturnValue(makeChain([{ id: 'o1', status: 'Pending Confirmation' }]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1/confirm', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ finalPrice: '150000' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe('POST /:id/assign', () => {
  it('200 admin', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'o1', status: 'Waiting Assignment' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1', availability: 'Available' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pu', email: 'p@t.com' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ fullName: 'Partner A', bookingNumber: 'SP-2026-000001' }]),
    );
    const res = await mkApp('admin').request('/api/v1/bookings/o1/assign', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ partnerId: PARTNER_USER_ID }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockNotif.createNotification).toHaveBeenCalled();
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/assign', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ partnerId: 'p' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
  });
  it('403 customer', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/accept', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
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
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
  });
  it('409 bad status', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Closed', customerId: 'p1' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/cancel', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Test' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/cancel', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Test' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('GET /:id', () => {
  it('200 customer', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'o1',
          customerId: 'cp1',
          status: 'Pending Confirmation',
          bookingNumber: 'SP-2026-0001',
          bookingDate: '2026-07-15',
          bookingTime: '10:00',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'oi1', serviceId: 's1', quantity: 1 }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ fromStatus: null, toStatus: 'Pending Confirmation', createdAt: new Date() }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    const data = body.data as { id: string; items: unknown[]; timeline: unknown[] };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(data.id).toBe('o1');
    expect(Array.isArray(data.items)).toBe(true);
    expect(Array.isArray(data.timeline)).toBe(true);
  });

  it('200 admin', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'o1',
          customerId: 'cp1',
          status: 'Pending Confirmation',
          bookingNumber: 'SP-2026-0001',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'oi1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/bookings/o1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('403 wrong customer', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', customerId: 'other-cp', status: 'Pending Confirmation' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1' }]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });
});

describe('POST /:id/reject', () => {
  it('200 partner', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Partner Assigned', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/reject', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Too busy' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
    expect(mockNotif.notifyAdmins).toHaveBeenCalled();
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/reject', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'N/A' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('404', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/reject', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Busy' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('422 missing reason', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/reject', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });

  it('409 bad transition', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Working', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/reject', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ reason: 'Busy' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });
});

describe('POST /:id/on-the-way', () => {
  it('200 partner', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Partner Accepted', partnerId: 'pp1' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ userId: 'cust-user-1' }]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/on-the-way', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockNotif.createNotification).toHaveBeenCalled();
  });

  it('403 customer', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('customer').request('/api/v1/bookings/o1/on-the-way', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('404', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/on-the-way', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('POST /:id/start', () => {
  it('200 partner', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'On The Way', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/start', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
    expect(mockNotif.notifyAdmins).toHaveBeenCalled();
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/start', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('409 bad transition', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Pending Confirmation', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/start', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it('500 transaction rollback when DB update fails', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'On The Way', partnerId: 'pp1' }]),
    );
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    });
    const res = await mkApp('partner').request('/api/v1/bookings/o1/start', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe('POST /:id/complete', () => {
  it('200 partner', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Working', partnerId: 'pp1', customerId: 'cp1' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ userId: 'cust-user' }]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/complete', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
    expect(mockNotif.notifyAdmins).toHaveBeenCalled();
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/bookings/o1/complete', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('404', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('partner').request('/api/v1/bookings/o1/complete', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('409 bad transition', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp1' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', status: 'Pending Confirmation', partnerId: 'pp1' }]),
    );
    const res = await mkApp('partner').request('/api/v1/bookings/o1/complete', {
      method: 'POST',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });
});
