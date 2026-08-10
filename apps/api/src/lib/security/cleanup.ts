import { lt } from 'drizzle-orm';
import { db, securityEvents } from '../db.ts';

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Hapus security_events yang lebih tua dari RETENTION_DAYS. Dijalankan
 * sekali saat startup lalu tiap 24 jam; failure tidak menggagalkan proses.
 */
async function runSecurityEventsCleanup(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    await db.delete(securityEvents).where(lt(securityEvents.createdAt, cutoff));
    console.info(`[security] cleanup: security_events > ${RETENTION_DAYS} hari dihapus`);
  } catch (err) {
    console.warn('[security] cleanup security_events gagal:', err);
  }
}

export function startSecurityEventsCleanup(): void {
  setInterval(() => void runSecurityEventsCleanup(), CLEANUP_INTERVAL_MS).unref();
  void runSecurityEventsCleanup();
}
