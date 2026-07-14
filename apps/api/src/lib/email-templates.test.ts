import { describe, it, expect, vi } from 'vitest';

const TEST_APP_URL = vi.hoisted(() => {
  process.env.APP_URL = 'http://localhost:4321';
  return 'http://localhost:4321';
});

import {
  passwordResetHtml,
  bookingConfirmationHtml,
  partnerAssignedHtml,
  partnerVerifiedHtml,
  verificationHtml,
  notificationEmailHtml,
  paymentVerifiedHtml,
} from './email-templates.ts';

function assertBaseHtml(html: string) {
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain('<html lang="id">');
  expect(html).toContain('<title>Ahli Panggilan</title>');
  expect(html).toContain('Ahli Panggilan — Perusahaan Layanan Jasa Profesional');
  expect(html).toContain('Email ini dikirim secara otomatis');
  expect(html).toContain(TEST_APP_URL);
}

describe('passwordResetHtml', () => {
  it('renders reset password email with correct content', () => {
    const html = passwordResetHtml('John Doe', 'https://example.com/reset?token=abc');
    assertBaseHtml(html);
    expect(html).toContain('Reset Password');
    expect(html).toContain('Halo John Doe,');
    expect(html).toContain('reset password');
    expect(html).toContain('https://example.com/reset?token=abc');
    expect(html).toContain('Reset Password');
    expect(html).toContain('Link ini berlaku selama 7 hari');
  });

  it('handles names with special characters', () => {
    const html = passwordResetHtml('João Müller & Friends', '/reset');
    expect(html).toContain('Halo João Müller & Friends,');
  });

  it('handles long names', () => {
    const longName = 'A'.repeat(100);
    const html = passwordResetHtml(longName, '/reset');
    expect(html).toContain('Halo ' + longName + ',');
  });
});

describe('bookingConfirmationHtml', () => {
  it('renders booking confirmation email with booking number', () => {
    const html = bookingConfirmationHtml(
      'Jane Doe',
      'SP-2026-000001',
      'https://example.com/track/SP-2026-000001',
    );
    assertBaseHtml(html);
    expect(html).toContain('Booking Dikonfirmasi');
    expect(html).toContain('Halo Jane Doe,');
    expect(html).toContain('#SP-2026-000001');
    expect(html).toContain('https://example.com/track/SP-2026-000001');
    expect(html).toContain('Lacak Status Booking');
    expect(html).toContain('teknisi terbaik');
  });

  it('renders with empty booking number (does not break)', () => {
    const html = bookingConfirmationHtml('Test', '', '/track');
    expect(html).toContain('Booking Anda dengan nomor');
    expect(html).toContain('Lacak Status Booking');
  });
});

describe('partnerAssignedHtml', () => {
  it('renders partner assigned email with booking number', () => {
    const html = partnerAssignedHtml(
      'Partner A',
      'SP-2026-000001',
      'https://example.com/dashboard',
    );
    assertBaseHtml(html);
    expect(html).toContain('Pekerjaan Baru');
    expect(html).toContain('Halo Partner A,');
    expect(html).toContain('#SP-2026-000001');
    expect(html).toContain('https://example.com/dashboard');
    expect(html).toContain('Lihat Pekerjaan');
    expect(html).toContain('ditugaskan untuk pekerjaan baru');
  });
});

describe('verificationHtml', () => {
  it('renders email verification email', () => {
    const html = verificationHtml('New User', 'https://example.com/verify?token=xyz');
    assertBaseHtml(html);
    expect(html).toContain('Verifikasi Email');
    expect(html).toContain('Halo New User,');
    expect(html).toContain('https://example.com/verify?token=xyz');
    expect(html).toContain('Verifikasi Email');
    expect(html).toContain('Link ini berlaku selama 7 hari');
  });
});

describe('notificationEmailHtml', () => {
  it('renders notification email with title and message', () => {
    const html = notificationEmailHtml(
      'User',
      'Booking Update',
      'Status pesanan Anda telah berubah menjadi Completed.',
    );
    assertBaseHtml(html);
    expect(html).toContain('Booking Update');
    expect(html).toContain('Halo User,');
    expect(html).toContain('Status pesanan Anda telah berubah menjadi Completed.');
  });

  it('preserves whitespace in message (white-space:pre-wrap)', () => {
    const html = notificationEmailHtml('User', 'Notif', 'Line 1\n\nLine 2');
    expect(html).toContain('white-space:pre-wrap');
    expect(html).toContain('Line 1');
    expect(html).toContain('Line 2');
  });

  it('handles HTML special characters in message', () => {
    const html = notificationEmailHtml('User', 'Test', 'Harga: Rp150.000 < 200.000 & diskon');
    expect(html).toContain('Harga: Rp150.000');
    expect(html).toContain('diskon');
  });
});

// ───── partnerVerifiedHtml ─────

describe('partnerVerifiedHtml', () => {
  it('renders approved status with "Mulai Bekerja" button', () => {
    const html = partnerVerifiedHtml('Partner A', 'Approved', null);
    assertBaseHtml(html);
    expect(html).toContain('Verifikasi Disetujui');
    expect(html).toContain('Halo Partner A,');
    expect(html).toContain('telah diverifikasi dan disetujui');
    expect(html).toContain('Mulai Bekerja');
    expect(html).toContain('/login');
  });

  it('renders rejected status without button', () => {
    const html = partnerVerifiedHtml('Partner B', 'Rejected', 'Dokumen tidak lengkap');
    assertBaseHtml(html);
    expect(html).toContain('Verifikasi Ditolak');
    expect(html).toContain('Halo Partner B,');
    expect(html).toContain('verifikasi akun mitra Anda ditolak');
    expect(html).not.toContain('Mulai Bekerja');
    expect(html).toContain('Dokumen tidak lengkap');
  });

  it('includes note when provided (approved)', () => {
    const html = partnerVerifiedHtml('Partner C', 'Approved', 'Selamat bergabung!');
    expect(html).toContain('Selamat bergabung!');
    expect(html).toContain('Catatan:');
  });

  it('omits note section when note is null', () => {
    const html = partnerVerifiedHtml('Partner D', 'Approved', null);
    expect(html).not.toContain('Catatan:');
  });

  it('handles rejected without note', () => {
    const html = partnerVerifiedHtml('Partner E', 'Rejected', null);
    expect(html).toContain('Verifikasi Ditolak');
    expect(html).not.toContain('Catatan:');
    expect(html).not.toContain('Mulai Bekerja');
  });
});

// ───── paymentVerifiedHtml ─────

describe('paymentVerifiedHtml', () => {
  it('renders paid status with confirmation details', () => {
    const html = paymentVerifiedHtml(
      'Customer A',
      'SP-2026-000001',
      'Rp150.000',
      'Transfer Bank',
      'Paid',
      null,
    );
    assertBaseHtml(html);
    expect(html).toContain('Pembayaran Dikonfirmasi');
    expect(html).toContain('Halo Customer A,');
    expect(html).toContain('#SP-2026-000001');
    expect(html).toContain('Rp150.000');
    expect(html).toContain('Transfer Bank');
    expect(html).toContain('Lunas');
    expect(html).toContain('Terima kasih telah menggunakan layanan Ahli Panggilan');
  });

  it('renders failed status without payment summary', () => {
    const html = paymentVerifiedHtml(
      'Customer B',
      'SP-2026-000002',
      'Rp200.000',
      'Transfer Bank',
      'Failed',
      'Saldo tidak mencukupi',
    );
    assertBaseHtml(html);
    expect(html).toContain('Pembayaran Ditolak');
    expect(html).toContain('Halo Customer B,');
    expect(html).toContain('pembayaran Anda tidak dapat diverifikasi');
    expect(html).toContain('Gagal');
    expect(html).toContain('Saldo tidak mencukupi');
    expect(html).toContain('Silakan hubungi admin untuk informasi lebih lanjut');
  });

  it('includes detail table with booking, amount, method, status', () => {
    const html = paymentVerifiedHtml('C', 'SP-001', 'Rp50.000', 'QRIS', 'Paid', null);
    expect(html).toContain('Booking');
    expect(html).toContain('Jumlah');
    expect(html).toContain('Metode');
    expect(html).toContain('Status');
    expect(html).toContain('#SP-001');
    expect(html).toContain('Rp50.000');
    expect(html).toContain('QRIS');
  });

  it('includes note when provided for paid status', () => {
    const html = paymentVerifiedHtml('C', 'SP-001', 'Rp50.000', 'QRIS', 'Paid', 'Pembayaran lunas');
    expect(html).toContain('Pembayaran lunas');
    expect(html).toContain('Catatan:');
  });

  it('omits note section when note is null', () => {
    const html = paymentVerifiedHtml('C', 'SP-001', 'Rp50.000', 'QRIS', 'Paid', null);
    expect(html).not.toContain('Catatan:');
  });

  it('renders all amounts and payment methods correctly', () => {
    const html = paymentVerifiedHtml(
      'C',
      'SP-001',
      'Rp1.000.000',
      'Virtual Account BCA',
      'Paid',
      null,
    );
    expect(html).toContain('Rp1.000.000');
    expect(html).toContain('Virtual Account BCA');
  });
});
