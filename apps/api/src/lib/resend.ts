import { Resend } from 'resend';

let _resend: Resend | null = null;

/** Lazy Resend client — only created when first used to avoid constructor throwing on empty key */
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

export const FROM_ADDRESS = process.env.RESEND_FROM ?? 'Spesialis <noreply@spesialis.id>';

/** Whether Resend is configured (true) or we should fall back to nodemailer/Mailpit (false) */
export const USE_RESEND = !!process.env.RESEND_API_KEY;
