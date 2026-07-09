import nodemailer from 'nodemailer';
import { getResend, FROM_ADDRESS, USE_RESEND } from './resend.ts';
import {
  passwordResetHtml,
  bookingConfirmationHtml,
  partnerAssignedHtml,
  partnerVerifiedHtml,
  verificationHtml,
  paymentVerifiedHtml,
  notificationEmailHtml,
  newBookingAdminHtml,
} from './email-templates.ts';

export const APP_URL = process.env.APP_URL ?? 'http://localhost:4321';

// Nodemailer (Mailpit) fallback — used in local dev without RESEND_API_KEY
const SMTP_HOST = process.env.SMTP_HOST ?? 'mailpit';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 1025);
const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_PASS = process.env.SMTP_PASS ?? '';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function sendViaResend(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
  });
}

async function sendViaNodemailer(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@spesialis.id',
    to,
    subject,
    text,
    html,
  });
}

function emailProviderLabel(): string {
  return USE_RESEND ? 'Resend' : 'Mailpit';
}

// ─── Shared dispatch helper ───────────────────────────────────────

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  label: string,
  ...extraLogArgs: unknown[]
): Promise<void> {
  try {
    if (USE_RESEND) {
      await sendViaResend(to, subject, text, html);
    } else {
      await sendViaNodemailer(to, subject, text, html);
    }
    console.info(`[Email/${emailProviderLabel()}] ${label}:`, to, ...extraLogArgs);
  } catch (err) {
    console.error(
      `[Email/${emailProviderLabel()}] Failed to send ${label}:`,
      to,
      ...extraLogArgs,
      err,
    );
  }
}

// ─── Public email functions ──────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  await sendEmail(
    email,
    'Reset Password — Spesialis',
    `Halo ${fullName},\n\nKami menerima permintaan reset password untuk akun Spesialis Anda.\n\nKlik link berikut untuk mereset password Anda:\n${resetUrl}\n\nLink ini berlaku selama 7 hari.\n\nJika Anda tidak meminta reset password, abaikan email ini.\n\n— Tim Spesialis`,
    passwordResetHtml(fullName, resetUrl),
    'Password reset',
  );
}

export async function sendBookingConfirmationEmail(
  email: string,
  fullName: string,
  bookingNumber: string,
  trackingUrl: string,
): Promise<void> {
  await sendEmail(
    email,
    `Booking Dikonfirmasi — #${bookingNumber}`,
    `Halo ${fullName},\n\nBooking Anda dengan nomor ${bookingNumber} telah dikonfirmasi.\n\nTim kami akan segera menugaskan teknisi terbaik untuk membantu Anda.\n\nLacak status booking:\n${trackingUrl}\n\n— Tim Spesialis`,
    bookingConfirmationHtml(fullName, bookingNumber, trackingUrl),
    'Booking confirmation',
    bookingNumber,
  );
}

export async function sendPartnerAssignedEmail(
  email: string,
  fullName: string,
  bookingNumber: string,
  dashboardUrl: string,
): Promise<void> {
  await sendEmail(
    email,
    `Pekerjaan Baru — #${bookingNumber}`,
    `Halo ${fullName},\n\nAnda ditugaskan untuk pekerjaan baru:\n\nNomor Booking: ${bookingNumber}\n\nSilakan login ke dashboard untuk melihat detail dan mengonfirmasi:\n${dashboardUrl}\n\n— Tim Spesialis`,
    partnerAssignedHtml(fullName, bookingNumber, dashboardUrl),
    'Partner assigned',
    bookingNumber,
  );
}

export async function sendPartnerVerifiedEmail(
  email: string,
  fullName: string,
  status: 'Approved' | 'Rejected',
  note: string | null,
): Promise<void> {
  const isApproved = status === 'Approved';
  const subject = isApproved
    ? 'Verifikasi Partner Disetujui — Spesialis'
    : 'Verifikasi Partner Ditolak — Spesialis';

  await sendEmail(
    email,
    subject,
    `Halo ${fullName},\n\n${
      isApproved
        ? 'Selamat! Akun mitra Anda telah diverifikasi dan disetujui. Anda sekarang dapat mulai menerima pekerjaan.'
        : 'Mohon maaf, verifikasi akun mitra Anda ditolak.'
    }\n${note ? `\nCatatan: ${note}` : ''}\n\n${isApproved ? '\nSilakan login untuk mulai menerima pekerjaan:' : '\nSilakan hubungi admin untuk informasi lebih lanjut:'}\n${APP_URL}/login\n\n— Tim Spesialis`,
    partnerVerifiedHtml(fullName, status, note),
    'Partner verification',
    status,
  );
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationToken: string,
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
  await sendEmail(
    email,
    'Verifikasi Email — Spesialis',
    `Halo ${fullName},\n\nTerima kasih telah mendaftar di Spesialis.\n\nSilakan verifikasi alamat email Anda dengan mengklik link berikut:\n${verifyUrl}\n\nLink ini berlaku selama 7 hari.\n\n— Tim Spesialis`,
    verificationHtml(fullName, verifyUrl),
    'Verification',
  );
}

export async function sendPaymentVerifiedEmail(
  email: string,
  fullName: string,
  bookingNumber: string,
  amount: string,
  paymentMethod: string,
  status: 'Paid' | 'Failed',
  note: string | null,
): Promise<void> {
  const isPaid = status === 'Paid';
  const subject = isPaid ? 'Pembayaran Dikonfirmasi — Spesialis' : 'Pembayaran Ditolak — Spesialis';

  await sendEmail(
    email,
    subject,
    `Halo ${fullName},\n\n${
      isPaid
        ? 'Pembayaran Anda telah dikonfirmasi.'
        : 'Mohon maaf, pembayaran Anda tidak dapat diverifikasi.'
    }\n\nDetail Pembayaran:\n  Booking: ${bookingNumber}\n  Jumlah: ${amount}\n  Metode: ${paymentMethod}\n  Status: ${status}\n${note ? `\nCatatan: ${note}` : ''}\n\n${isPaid ? '\nTerima kasih telah menggunakan layanan Spesialis.' : '\nSilakan hubungi admin untuk informasi lebih lanjut.'}\n\n— Tim Spesialis`,
    paymentVerifiedHtml(fullName, bookingNumber, amount, paymentMethod, status, note),
    'Payment verification',
    bookingNumber,
    status,
  );
}

export async function sendNewBookingToAdmin(
  email: string,
  fullName: string,
  bookingNumber: string,
  customerName: string,
  customerPhone: string,
  address: string,
  bookingDate: string,
  bookingTime: string,
  notes: string | null,
  items: { name: string; qty: number }[],
): Promise<void> {
  const adminUrl = `${APP_URL}/dashboard/admin/bookings`;
  await sendEmail(
    email,
    `Booking Baru — #${bookingNumber}`,
    `Halo ${fullName},\n\nBooking baru telah dibuat dan menunggu konfirmasi.\n\nNomor Booking: ${bookingNumber}\nPelanggan: ${customerName}\nTelepon: ${customerPhone}\nTanggal: ${bookingDate}\nWaktu: ${bookingTime}\nAlamat: ${address}\n${notes ? `\nCatatan: ${notes}` : ''}\n\nSegera konfirmasi booking ini melalui dashboard admin.\n${adminUrl}\n\n— Tim Spesialis`,
    newBookingAdminHtml(
      bookingNumber,
      customerName,
      customerPhone,
      address,
      bookingDate,
      bookingTime,
      notes,
      items,
      adminUrl,
    ),
    'New booking notification',
    bookingNumber,
  );
}

export async function sendNotificationEmail(
  email: string,
  fullName: string,
  title: string,
  message: string,
): Promise<void> {
  await sendEmail(
    email,
    `${title} — Spesialis`,
    `Halo ${fullName},\n\n${message}\n\n— Tim Spesialis`,
    notificationEmailHtml(fullName, title, message),
    'Notification',
    title,
  );
}
