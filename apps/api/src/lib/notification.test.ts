import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = { insert: vi.fn(), select: vi.fn() };
const mockUsers = { id: 'users.id' as string };
vi.mock('./db.ts', () => ({ db: mockDb, notifications: {}, users: mockUsers }));
vi.mock('./email.ts', () => ({ sendNotificationEmail: vi.fn() }));
vi.mock('./whatsapp.ts', () => ({ sendWhatsApp: vi.fn() }));

import { sendNotificationEmail } from './email.ts';
import { sendWhatsApp } from './whatsapp.ts';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNotification', () => {
  it('stores notification in DB for In App channel', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-1',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Your booking is confirmed',
    });

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'In App', userId: 'uid-1', type: 'booking.confirm' }),
    );
    expect(sendNotificationEmail).not.toHaveBeenCalled();
    expect(sendWhatsApp).not.toHaveBeenCalled();
  });

  it('sends email when channel is Email', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-2',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Your booking is confirmed',
      channel: 'Email',
      email: 'user@test.com',
      fullName: 'User',
    });

    expect(sendNotificationEmail).toHaveBeenCalledWith(
      'user@test.com',
      'User',
      'Confirmed',
      'Your booking is confirmed',
    );
  });

  it('does not send email when fullName is missing', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-3',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Message',
      channel: 'Email',
      email: 'user@test.com',
    });

    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('sends WhatsApp when channel is WhatsApp', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-4',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Booking confirmed',
      channel: 'WhatsApp',
      phone: '08123456789',
    });

    expect(sendWhatsApp).toHaveBeenCalledWith('08123456789', 'Booking confirmed');
  });

  it('does not send WhatsApp when phone is missing', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-5',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Booking confirmed',
      channel: 'WhatsApp',
    });

    expect(sendWhatsApp).not.toHaveBeenCalled();
  });

  it('defaults to In App channel when channel is not provided', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-6',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Test',
    });

    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({ channel: 'In App' }));
  });

  it('fires email as part of createNotification flow', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mod = await import('./notification.ts');
    await mod.createNotification({
      userId: 'uid-7',
      type: 'booking.confirm',
      title: 'Confirmed',
      message: 'Message',
      channel: 'Email',
      email: 'user@test.com',
      fullName: 'User',
    });

    expect(sendNotificationEmail).toHaveBeenCalledWith(
      'user@test.com',
      'User',
      'Confirmed',
      'Message',
    );
  });
});

describe('notifyAdmins', () => {
  it('sends notification to all admin-role users', async () => {
    const mockWhere = vi
      .fn()
      .mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }, { id: 'admin-3' }]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    const mod = await import('./notification.ts');
    await mod.notifyAdmins('new.booking', 'New Booking', 'A new booking was created');

    expect(mockDb.select).toHaveBeenCalledWith({ id: mockUsers.id });
    expect(mockFrom).toHaveBeenCalledWith(mockUsers);
    expect(mockWhere).toHaveBeenCalled();
  });

  it('sends createNotification for each admin', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: mockValues });

    const mockWhere = vi.fn().mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    const mod = await import('./notification.ts');
    await mod.notifyAdmins('new.booking', 'New Booking', 'A new booking was created');

    expect(mockValues).toHaveBeenCalledTimes(2);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin-1', type: 'new.booking' }),
    );
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin-2', type: 'new.booking' }),
    );
  });

  it('does nothing when no admins exist', async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    mockDb.select.mockReturnValue({ from: mockFrom });

    const mod = await import('./notification.ts');
    await mod.notifyAdmins('type', 'Title', 'Message');

    expect(mockDb.select).toHaveBeenCalled();
  });
});
