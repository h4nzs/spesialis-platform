import { sql } from 'drizzle-orm';
import { db } from './db.ts';

/**
 * Generate a unique booking number using a PostgreSQL sequence.
 *
 * Uses `nextval('booking_number_seq')` for guaranteed atomicity under
 * concurrent requests — unlike the old `MAX()+1` approach which could
 * produce duplicates in READ COMMITTED isolation.
 *
 * PostgreSQL sequences are atomic (ACID): two concurrent `nextval()` calls
 * always return different values, regardless of transaction isolation level.
 * This makes the function safe to call before or inside a transaction.
 *
 * Format: `SP-YYYY-NNNNNN`
 *   - SP   = prefix (Specialist Platform)
 *   - YYYY = current year
 *   - NNNNNN = zero-padded sequence value (e.g. 000001, 000042)
 *
 * @returns The formatted booking number string.
 */
export async function generateBookingNumber(): Promise<string> {
  const rows = await db.execute<{ nextval: string }>(
    sql`SELECT nextval('booking_number_seq') AS nextval`,
  );

  const result = rows[0];
  if (!result) {
    throw new Error('Gagal menghasilkan nomor booking: sequence tidak mengembalikan nilai');
  }

  const year = new Date().getFullYear();
  const seqValue = Number(result.nextval);

  return `SP-${year}-${String(seqValue).padStart(6, '0')}`;
}
