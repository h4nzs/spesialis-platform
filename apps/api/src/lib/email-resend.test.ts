import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted for the mock function so it's available in the vi.mock factory
const { mockResendSend } = vi.hoisted(() => ({
  mockResendSend: vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null }),
}));

// Mock resend as a proper class so new Resend() works as a constructor
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockResendSend };
  },
}));

// Set RESEND_API_KEY so USE_RESEND is true when email.ts imports resend.ts
process.env.RESEND_API_KEY = 're_test_key';
process.env.RESEND_FROM = 'Test <test@spesialis.id>';
process.env.APP_URL = 'http://localhost:4321';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendPasswordResetEmail (Resend)', () => {
  it('sends via resend with correct subject and reset URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendPasswordResetEmail('user@test.com', 'User', 'reset-token-123');

    expect(mockResendSend).toHaveBeenCalledTimes(1);
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Test <test@spesialis.id>',
        to: 'user@test.com',
        subject: 'Reset Password — Spesialis',
        text: expect.stringContaining('reset-token-123'),
      }),
    );
    const callArgs = mockResendSend.mock.calls[0]![0];
    expect(callArgs.text).toContain('http://localhost:4321/reset-password?token=reset-token-123');
    expect(callArgs.html).toContain('Reset Password');
  });
});

describe('sendBookingConfirmationEmail (Resend)', () => {
  it('sends via resend with booking number and tracking URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendBookingConfirmationEmail(
      'user@test.com',
      'User',
      'SP-2026-0001',
      'http://localhost/track/SP-2026-0001',
    );

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        from: 'Test <test@spesialis.id>',
        subject: 'Booking Dikonfirmasi — #SP-2026-0001',
        text: expect.stringContaining('http://localhost/track/SP-2026-0001'),
      }),
    );
  });

  it('includes HTML template in html field', async () => {
    const mod = await import('./email.ts');
    await mod.sendBookingConfirmationEmail(
      'user@test.com',
      'User',
      'SP-2026-0001',
      'http://localhost/track',
    );

    const callArgs = mockResendSend.mock.calls[0]![0];
    expect(callArgs.html).toContain('Booking Dikonfirmasi');
    expect(callArgs.html).toContain('<!DOCTYPE html>');
    expect(callArgs.html).toContain('Lacak Status Booking');
  });
});

describe('sendPartnerAssignedEmail (Resend)', () => {
  it('sends via resend with booking number and dashboard URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerAssignedEmail(
      'partner@test.com',
      'Partner',
      'SP-2026-0002',
      'http://localhost/dashboard',
    );

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: 'Pekerjaan Baru — #SP-2026-0002',
        text: expect.stringContaining('http://localhost/dashboard'),
      }),
    );
  });
});

describe('sendPartnerVerifiedEmail (Resend)', () => {
  it('sends approved email via resend', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerVerifiedEmail('partner@test.com', 'Partner', 'Approved', null);

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: 'Verifikasi Partner Disetujui — Spesialis',
      }),
    );
  });

  it('sends rejected email via resend with note', async () => {
    const mod = await import('./email.ts');
    await mod.sendPartnerVerifiedEmail(
      'partner@test.com',
      'Partner',
      'Rejected',
      'Dokumen tidak lengkap',
    );

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@test.com',
        subject: 'Verifikasi Partner Ditolak — Spesialis',
        text: expect.stringContaining('Dokumen tidak lengkap'),
      }),
    );
  });
});

describe('sendVerificationEmail (Resend)', () => {
  it('sends via resend with verification URL', async () => {
    const mod = await import('./email.ts');
    await mod.sendVerificationEmail('user@test.com', 'User', 'verify-token-456');

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Verifikasi Email — Spesialis',
        text: expect.stringContaining('http://localhost:4321/verify-email?token=verify-token-456'),
      }),
    );
  });
});

describe('sendPaymentVerifiedEmail (Resend)', () => {
  it('sends paid confirmation via resend', async () => {
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

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pembayaran Dikonfirmasi — Spesialis',
        text: expect.stringContaining('SP-2026-0003'),
      }),
    );
  });

  it('sends failed payment via resend with note', async () => {
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

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pembayaran Ditolak — Spesialis',
        text: expect.stringContaining('Saldo tidak mencukupi'),
      }),
    );
  });
});

describe('sendNotificationEmail (Resend)', () => {
  it('sends via resend with title and message', async () => {
    const mod = await import('./email.ts');
    await mod.sendNotificationEmail(
      'user@test.com',
      'User',
      'Pengingat Booking',
      'Booking Anda akan segera dimulai.',
    );

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Pengingat Booking — Spesialis',
        text: expect.stringContaining('Booking Anda akan segera dimulai.'),
      }),
    );
  });
});

describe('Error handling (Resend)', () => {
  it('handles resend send failure without throwing', async () => {
    mockResendSend.mockRejectedValueOnce(new Error('Resend API error'));

    const mod = await import('./email.ts');
    await expect(
      mod.sendPasswordResetEmail('user@test.com', 'User', 'token'),
    ).resolves.not.toThrow();
  });
});
