import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST ?? 'mailpit';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 1025);
const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_PASS = process.env.SMTP_PASS ?? '';
const APP_URL = process.env.APP_URL ?? 'http://localhost:4321';
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
    throw err;
  }
}
