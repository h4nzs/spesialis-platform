import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = { insert: vi.fn() };
const mockOrderStatusHistory = { id: 'orderStatusHistory.id' as string };
vi.mock('./db.ts', () => ({ db: mockDb, orderStatusHistory: mockOrderStatusHistory }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('recordStatusHistory', () => {
  it('records a status transition with all fields', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const { recordStatusHistory } = await import('./order-status.ts');
    await recordStatusHistory(
      'order-1',
      'Pending Confirmation' as any,
      'Confirmed' as any,
      'admin-1',
      'Disetujui oleh admin',
    );

    expect(mockDb.insert).toHaveBeenCalledWith(mockOrderStatusHistory);
    expect(mockValues).toHaveBeenCalledWith({
      orderId: 'order-1',
      fromStatus: 'Pending Confirmation',
      toStatus: 'Confirmed',
      changedBy: 'admin-1',
      note: 'Disetujui oleh admin',
    });
  });

  it('records with null from status (initial creation)', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const { recordStatusHistory } = await import('./order-status.ts');
    await recordStatusHistory('order-1', null, 'Pending' as any, null);

    expect(mockValues).toHaveBeenCalledWith({
      orderId: 'order-1',
      fromStatus: null,
      toStatus: 'Pending',
      changedBy: null,
      note: null,
    });
  });

  it('uses null for note when not provided', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const { recordStatusHistory } = await import('./order-status.ts');
    await recordStatusHistory('order-2', 'Confirmed' as any, 'Working' as any, 'partner-1');

    expect(mockValues).toHaveBeenCalledWith({
      orderId: 'order-2',
      fromStatus: 'Confirmed',
      toStatus: 'Working',
      changedBy: 'partner-1',
      note: null,
    });
  });

  it('handles guest bookings (changedBy is null)', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const { recordStatusHistory } = await import('./order-status.ts');
    await recordStatusHistory('order-guest', null, 'Pending' as any, null);

    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({ changedBy: null }));
  });

  it('handles empty string as note', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const { recordStatusHistory } = await import('./order-status.ts');
    await recordStatusHistory('order-3', 'Working' as any, 'Completed' as any, 'partner-2', '');

    // Empty string should NOT be replaced by null, it stays as empty string
    expect(mockValues).toHaveBeenCalledWith({
      orderId: 'order-3',
      fromStatus: 'Working',
      toStatus: 'Completed',
      changedBy: 'partner-2',
      note: '',
    });
  });

  it('rejects when db.insert fails (propagates error)', async () => {
    const mockError = new Error('DB connection failed');
    mockDb.insert.mockReturnValue({ values: vi.fn().mockRejectedValue(mockError) });

    const { recordStatusHistory } = await import('./order-status.ts');
    await expect(recordStatusHistory('order-1', null, 'Pending' as any, null)).rejects.toThrow(
      'DB connection failed',
    );
  });
});
