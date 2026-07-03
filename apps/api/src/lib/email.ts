import nodemailer from 'nodemailer';

export const APP_URL = process.env.APP_URL ?? 'http://localhost:4321';
const SMTP_HOST = process.env.SMTP_HOST ?? 'mailpit';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 1025);
const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_PASS = process.env.SMTP_PASS ?? '';
const FROM_ADDRESS = process.env.SMTP_FROM ?? 'noreply@spesialis.id';

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

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const text = `Halo ${fullName},

Kami menerima permintaan reset password untuk akun Spesialis Anda.

Klik link berikut untuk mereset password Anda:
${resetUrl}

Link ini berlaku selama 7 hari.

Jika Anda tidak meminta reset password, abaikan email ini.

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Reset Password — Spesialis',
      text,
    });
    console.info('[Email] Password reset email sent:', email);
  } catch (err) {
    console.error('[Email] Failed to send password reset email:', email, err);
  }
}

export async function sendBookingConfirmationEmail(
  email: string,
  fullName: string,
  bookingNumber: string,
  trackingUrl: string,
): Promise<void> {
  const text = `Halo ${fullName},

Booking Anda dengan nomor ${bookingNumber} telah dikonfirmasi.

Tim kami akan segera menugaskan teknisi terbaik untuk membantu Anda.

Lacak status booking:
${trackingUrl}

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `Booking Dikonfirmasi — #${bookingNumber}`,
      text,
    });
    console.info('[Email] Booking confirmation sent:', email, bookingNumber);
  } catch (err) {
    console.error('[Email] Failed to send booking confirmation:', email, bookingNumber, err);
  }
}

export async function sendPartnerAssignedEmail(
  email: string,
  fullName: string,
  bookingNumber: string,
  dashboardUrl: string,
): Promise<void> {
  const text = `Halo ${fullName},

Anda ditugaskan untuk pekerjaan baru:

Nomor Booking: ${bookingNumber}

Silakan login ke dashboard untuk melihat detail dan mengonfirmasi:
${dashboardUrl}

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `Pekerjaan Baru — #${bookingNumber}`,
      text,
    });
    console.info('[Email] Partner assigned email sent:', email, bookingNumber);
  } catch (err) {
    console.error('[Email] Failed to send partner assigned email:', email, bookingNumber, err);
  }
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

  const text = `Halo ${fullName},

${
  isApproved
    ? 'Selamat! Akun mitra Anda telah diverifikasi dan disetujui. Anda sekarang dapat mulai menerima pekerjaan.'
    : 'Mohon maaf, verifikasi akun mitra Anda ditolak.'
}
${note ? `\nCatatan: ${note}` : ''}

${isApproved ? '\nSilakan login untuk mulai menerima pekerjaan:' : '\nSilakan hubungi admin untuk informasi lebih lanjut:'}
${APP_URL}/login

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      text,
    });
    console.info('[Email] Partner verification email sent:', email, status);
  } catch (err) {
    console.error('[Email] Failed to send partner verification email:', email, err);
  }
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationToken: string,
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

  const text = `Halo ${fullName},

Terima kasih telah mendaftar di Spesialis.

Silakan verifikasi alamat email Anda dengan mengklik link berikut:
${verifyUrl}

Link ini berlaku selama 7 hari.

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Verifikasi Email — Spesialis',
      text,
    });
    console.info('[Email] Verification email sent:', email);
  } catch (err) {
    console.error('[Email] Failed to send verification email:', email, err);
  }
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

  const text = `Halo ${fullName},

${
  isPaid
    ? 'Pembayaran Anda telah dikonfirmasi.'
    : 'Mohon maaf, pembayaran Anda tidak dapat diverifikasi.'
}

Detail Pembayaran:
  Booking: ${bookingNumber}
  Jumlah: ${amount}
  Metode: ${paymentMethod}
  Status: ${status}
${note ? `\nCatatan: ${note}` : ''}

${isPaid ? '\nTerima kasih telah menggunakan layanan Spesialis.' : '\nSilakan hubungi admin untuk informasi lebih lanjut.'}

— Tim Spesialis`;

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      text,
    });
    console.info('[Email] Payment verification email sent:', email, bookingNumber, status);
  } catch (err) {
    console.error('[Email] Failed to send payment verification email:', email, err);
  }
}
