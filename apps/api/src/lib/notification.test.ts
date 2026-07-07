import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const mockDb = { insert: vi.fn(), select: vi.fn() };
const mockUsers = { id: 'users.id' as string, phone: 'users.phone' as string };
vi.mock('./db.ts', () => ({ db: mockDb, notifications: {}, users: mockUsers }));
vi.mock('./email.ts', () => ({ sendNotificationEmail: vi.fn() }));
vi.mock('./whatsapp.ts', () => ({ sendWhatsApp: vi.fn() }));

import { sendNotificationEmail } from './email.ts';
import { sendWhatsApp } from './whatsapp.ts';

let createNotification: (params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  channel?: 'Email' | 'WhatsApp' | 'Push' | 'In App';
  email?: string;
  fullName?: string;
  phone?: string;
}) => Promise<void>;

let notifyAdmins: (type: string, title: string, message: string) => Promise<void>;

beforeAll(async () => {
  const mod = await import('./notification.ts');
  createNotification = mod.createNotification;
  notifyAdmins = mod.notifyAdmins;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNotification', () => {
  function mockPhoneLookup(phone: string | null) {
    const mockLimit = vi.fn().mockResolvedValue(phone ? [{ phone }] : []);
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });
  }

  function mockInsert() {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });
    return mockValues;
  }

  it('stores in-app notification and sends WhatsApp when user has phone', async () => {
    mockPhoneLookup('08123456789');
    const mockValues = mockInsert();

    await createNotification({
      userId: 'uid-1',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Your booking is confirmed',
    });

    // Should store as In App
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'In App', userId: 'uid-1', type: 'booking.confirm' }),
    );
    // Should send WhatsApp since phone was looked up
    expect(sendWhatsApp).toHaveBeenCalledWith('08123456789', 'Your booking is confirmed');
    // Should NOT send email
    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('does not send WhatsApp when user has no phone in DB', async () => {
    mockPhoneLookup(null);
    mockInsert();

    await createNotification({
      userId: 'uid-2',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Message',
    });

    expect(sendWhatsApp).not.toHaveBeenCalled();
  });

  it('uses provided phone instead of looking up DB', async () => {
    // DB lookup not called because phone is provided
    mockInsert();

    await createNotification({
      userId: 'uid-3',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Booking confirmed',
      phone: '08123456789',
    });

    expect(sendWhatsApp).toHaveBeenCalledWith('08123456789', 'Booking confirmed');
    // Should NOT have done DB lookup
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it('sends email when channel is Email and email + fullName are provided', async () => {
    mockPhoneLookup('08123456789');
    const mockValues = mockInsert();

    await createNotification({
      userId: 'uid-4',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Your booking is confirmed',
      channel: 'Email',
      email: 'user@test.com',
      fullName: 'User',
    });

    // Should still store as In App
    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({ channel: 'In App' }));
    // Should send WhatsApp (phone found)
    expect(sendWhatsApp).toHaveBeenCalled();
    // Should ALSO send email
    expect(sendNotificationEmail).toHaveBeenCalledWith(
      'user@test.com',
      'User',
      'Confirmed',
      'Your booking is confirmed',
    );
  });

  it('does not send email when fullName is missing', async () => {
    mockPhoneLookup(null);
    mockInsert();

    await createNotification({
      userId: 'uid-5',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Message',
      channel: 'Email',
      email: 'user@test.com',
    });

    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('always stores with In App channel regardless of params', async () => {
    mockPhoneLookup(null);
    const mockValues = mockInsert();

    await createNotification({
      userId: 'uid-6',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Test',
    });

    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({ channel: 'In App' }));
  });

  it('sends WhatsApp and Email simultaneously when both are possible', async () => {
    mockPhoneLookup('08123456789');
    mockInsert();

    await createNotification({
      userId: 'uid-7',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Multi-channel notification',
      channel: 'Email',
      email: 'user@test.com',
      fullName: 'User',
    });

    expect(sendWhatsApp).toHaveBeenCalledWith('08123456789', 'Multi-channel notification');
    expect(sendNotificationEmail).toHaveBeenCalledWith(
      'user@test.com',
      'User',
      'Confirmed',
      'Multi-channel notification',
    );
  });
});

describe('notifyAdmins', () => {
  function mockAdminDb(admins: { id: string }[], phone: string | null) {
    const mockLimit = vi.fn().mockResolvedValue(phone ? [{ phone }] : []);
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });

    // First call = admin lookup, subsequent calls = phone lookups per admin
    mockDb.select
      .mockImplementationOnce(() => ({
        from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(admins) }),
      }))
      .mockImplementation(() => ({ from: mockFrom }));
  }

  function mockInsert() {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });
    return mockValues;
  }

  it('sends notification to all admin-role users', async () => {
    mockAdminDb([{ id: 'admin-1' }, { id: 'admin-2' }, { id: 'admin-3' }], '08123456789');
    mockInsert();

    await notifyAdmins('new.booking', 'New Booking', 'A new booking was created');

    expect(mockDb.select).toHaveBeenCalled();
  });

  it('sends in-app notification for each admin', async () => {
    const mockValues = mockInsert();
    mockAdminDb([{ id: 'admin-1' }, { id: 'admin-2' }], null);

    await notifyAdmins('new.booking', 'New Booking', 'A new booking was created');

    expect(mockValues).toHaveBeenCalledTimes(2);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin-1', type: 'new.booking' }),
    );
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin-2', type: 'new.booking' }),
    );
  });

  it('does nothing when no admins exist', async () => {
    mockInsert();
    mockAdminDb([], null);

    await notifyAdmins('type', 'Title', 'Message');

    expect(mockDb.select).toHaveBeenCalled();
  });
});
