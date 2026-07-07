import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = { insert: vi.fn() };
vi.mock('./db.ts', () => ({ db: mockDb, auditLogs: {} }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createAuditLog', () => {
  it('inserts audit log with IP from x-forwarded-for', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: {
        header: vi.fn((h: string) => (h === 'x-forwarded-for' ? '203.0.113.1' : undefined)),
      },
    } as any;

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-1',
      action: 'update',
      entity: 'order',
      entityId: 'ord-123',
      oldValue: { status: 'pending' },
      newValue: { status: 'confirmed' },
    });

    expect(mockDb.insert).toHaveBeenCalled();
    expect(valuesFn).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'uid-1',
        action: 'update',
        entity: 'order',
        entityId: 'ord-123',
        ipAddress: '203.0.113.1',
      }),
    );
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: {
        header: vi.fn((h: string) => (h === 'x-real-ip' ? '10.0.0.5' : undefined)),
      },
    } as any;

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-2',
      action: 'create',
      entity: 'user',
      entityId: 'usr-456',
    });

    expect(valuesFn).toHaveBeenCalledWith(expect.objectContaining({ ipAddress: '10.0.0.5' }));
  });

  it('sets ipAddress to null when no IP headers present', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: { header: vi.fn(() => undefined) },
    } as any;

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-3',
      action: 'delete',
      entity: 'document',
      entityId: 'doc-789',
    });

    expect(valuesFn).toHaveBeenCalledWith(expect.objectContaining({ ipAddress: null }));
  });

  it('captures user-agent header', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: {
        header: vi.fn((h: string) => (h === 'user-agent' ? 'TestAgent/1.0' : undefined)),
      },
    } as any;

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-4',
      action: 'login',
      entity: 'session',
      entityId: 'sess-001',
    });

    expect(valuesFn).toHaveBeenCalledWith(expect.objectContaining({ userAgent: 'TestAgent/1.0' }));
  });

  it('passes oldValue and newValue when provided', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: { header: vi.fn(() => undefined) },
    } as any;

    const oldVal = { name: 'Old Name' };
    const newVal = { name: 'New Name' };

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-5',
      action: 'rename',
      entity: 'profile',
      entityId: 'prof-002',
      oldValue: oldVal,
      newValue: newVal,
    });

    expect(valuesFn).toHaveBeenCalledWith(
      expect.objectContaining({ oldValue: oldVal, newValue: newVal }),
    );
  });

  it('sets oldValue and newValue to null when not provided', async () => {
    const valuesFn = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesFn });

    const mockC = {
      req: { header: vi.fn(() => undefined) },
    } as any;

    const mod = await import('./audit.ts');
    await mod.createAuditLog(mockC, {
      userId: 'uid-6',
      action: 'view',
      entity: 'report',
      entityId: 'rpt-003',
    });

    expect(valuesFn).toHaveBeenCalledWith(
      expect.objectContaining({ oldValue: null, newValue: null }),
    );
  });
});
