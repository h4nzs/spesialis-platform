import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendMail = vi.fn().mockResolvedValue(undefined);
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendPasswordResetEmail', () => {
  it('sends reset email with correct subject and reset URL', async () => {
    process.env.APP_URL = 'http://localhost:4321';
    const mod = await import('./email.ts');
    await mod.sendPasswordResetEmail('user@test.com', 'User', 'reset-token-123');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Reset Password — Spesialis',
        text: expect.stringContaining('reset-token-123'),
      }),
    );
    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.text).toContain('http://localhost:4321/reset-password?token=reset-token-123');
  });

  it('uses fallback APP_URL when env not set', async () => {
    delete process.env.APP_URL;
    const mod = await import('./email.ts');
    await mod.sendPasswordResetEmail('user@test.com', 'User', 'tok');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Reset Password — Spesialis',
      }),
    );
  });
});

describe('sendBookingConfirmationEmail', () => {
  it('sends confirmation email with booking number and tracking URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendBookingConfirmationEmail(
      'user@test.com',
      'User',
      'SP-2026-0001',
      'http://localhost/track/SP-2026-0001',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.stringContaining('SP-2026-0001'),
        text: expect.stringContaining('http://localhost/track/SP-2026-0001'),
      }),
    );
  });
});

describe('sendPartnerAssignedEmail', () => {
  it('sends partner assigned email with booking number and dashboard URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerAssignedEmail(
      'partner@test.com',
      'Partner',
      'SP-2026-0002',
      'http://localhost/partner/dashboard',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: expect.stringContaining('SP-2026-0002'),
        text: expect.stringContaining('http://localhost/partner/dashboard'),
      }),
    );
  });
});

describe('sendPartnerVerifiedEmail', () => {
  it('sends approved email when status is Approved', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerVerifiedEmail('partner@test.com', 'Partner', 'Approved', null);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: 'Verifikasi Partner Disetujui — Spesialis',
      }),
    );
  });

  it('sends rejected email when status is Rejected', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerVerifiedEmail(
      'partner@test.com',
      'Partner',
      'Rejected',
      'Dokumen tidak lengkap',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: 'Verifikasi Partner Ditolak — Spesialis',
        text: expect.stringContaining('Dokumen tidak lengkap'),
      }),
    );
  });
});

describe('sendVerificationEmail', () => {
  it('sends verification email with verification URL', async () => {
    process.env.APP_URL = 'http://localhost:4321';
    const mod = await import('./email.ts');
    await mod.sendVerificationEmail('user@test.com', 'User', 'verify-token-456');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Verifikasi Email — Spesialis',
        text: expect.stringContaining('http://localhost:4321/verify-email?token=verify-token-456'),
      }),
    );
  });
});

describe('sendPaymentVerifiedEmail', () => {
  it('sends paid confirmation for Paid status', async () => {
    const mod = await import('./email.ts');
    await mod.sendPaymentVerifiedEmail(
      'user@test.com',
      'User',
      'SP-2026-0003',
      'Rp 500.000',
      'Bank Transfer',
      'Paid',
      null,
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pembayaran Dikonfirmasi — Spesialis',
        text: expect.stringContaining('SP-2026-0003'),
      }),
    );
  });

  it('sends failed payment for Failed status', async () => {
    const mod = await import('./email.ts');
    await mod.sendPaymentVerifiedEmail(
      'user@test.com',
      'User',
      'SP-2026-0003',
      'Rp 500.000',
      'Bank Transfer',
      'Failed',
      'Saldo tidak mencukupi',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pembayaran Ditolak — Spesialis',
        text: expect.stringContaining('Saldo tidak mencukupi'),
      }),
    );
  });
});

describe('sendNotificationEmail', () => {
  it('sends notification email with title and message', async () => {
    const mod = await import('./email.ts');
    await mod.sendNotificationEmail(
      'user@test.com',
      'User',
      'Pengingat Booking',
      'Booking Anda akan segera dimulai.',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pengingat Booking — Spesialis',
        text: expect.stringContaining('Booking Anda akan segera dimulai.'),
      }),
    );
  });
});
