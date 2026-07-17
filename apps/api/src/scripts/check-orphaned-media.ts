#!/usr/bin/env tsx
/**
 * Check Orphaned Media Records
 *
 * Mendeteksi media records di database yang disk='Cloudflare R2'
 * tapi file-nya sudah tidak ada di R2 bucket (404).
 *
 * Cara pakai:
 *   pnpm --filter @ahlipanggilan/api db:check-media
 *   pnpm --filter @ahlipanggilan/api db:check-media --delete --force
 *
 * Opsi:
 *   --delete    Hapus orphaned records dari database
 *   --force     Konfirmasi penghapusan (wajib bersama --delete)
 */

import { db } from '@ahlipanggilan/database';
import { media } from '@ahlipanggilan/database/schema';
import { eq } from 'drizzle-orm';
import { getR2PublicUrl } from '../lib/storage.ts';

// ── Types ─────────────────────────────────────────────────────────────

interface OrphanedRecord {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

type FileCheckResult =
  { status: 'exists' } | { status: 'orphaned' } | { status: 'ambiguous'; error: string };

// ── Check file existence via HEAD request ────────────────────────────

async function checkFileInR2(url: string): Promise<FileCheckResult> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return { status: 'exists' };
    if (res.status === 404) return { status: 'orphaned' };
    return { status: 'ambiguous', error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: 'ambiguous', error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const shouldDelete = args.includes('--delete');
  const shouldForce = args.includes('--force');

  // ── Validasi env (R2_PUBLIC_URL sudah dicek oleh getR2PublicUrl) ──
  if (!process.env.R2_PUBLIC_URL && (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET)) {
    console.error('❌ R2 not configured. Set R2_PUBLIC_URL, or R2_ENDPOINT + R2_BUCKET in .env');
    process.exit(1);
  }

  console.log('🔍 Checking for orphaned R2 media records...\n');

  // ── Query semua media R2 ──────────────────────────────────────────
  const records = await db
    .select({
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      url: media.path,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(eq(media.disk, 'Cloudflare R2'))
    .orderBy(media.createdAt);

  console.log(`📊 Total media records with disk='Cloudflare R2': ${records.length}\n`);

  if (records.length === 0) {
    console.log('✅ Tidak ada media dengan disk Cloudflare R2.');
    process.exit(0);
  }

  // ── Periksa tiap file ─────────────────────────────────────────────
  const orphaned: OrphanedRecord[] = [];
  const ambiguous: Array<{ filename: string; error: string }> = [];
  let checked = 0;

  for (const record of records) {
    checked++;
    const publicUrl = getR2PublicUrl(record.filename);
    process.stdout.write(`  [${checked}/${records.length}] ${record.filename}... `);

    const result = await checkFileInR2(publicUrl);

    if (result.status === 'exists') {
      console.log('✅');
    } else if (result.status === 'orphaned') {
      console.log('❌ ORPHANED');
      orphaned.push({
        id: record.id,
        filename: record.filename,
        mimeType: record.mimeType,
        size: record.size,
        url: publicUrl,
        createdAt: record.createdAt,
      });
    } else {
      console.log(`⚠️  AMBIGUOUS — ${result.error}`);
      ambiguous.push({ filename: record.filename, error: result.error });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────
  console.log(`\n📋 Summary:`);
  console.log(`   Total R2 records  : ${records.length}`);
  console.log(`   Existing files    : ${records.length - orphaned.length - ambiguous.length}`);
  console.log(`   Orphaned records  : ${orphaned.length}`);
  console.log(`   Ambiguous (skipped): ${ambiguous.length}`);

  if (orphaned.length === 0) {
    console.log('\n✅ Semua file R2 intact. Tidak ada orphaned records.');
    if (ambiguous.length > 0) {
      console.log(`⚠️  ${ambiguous.length} file tidak bisa diverifikasi:`);
      for (const a of ambiguous) {
        console.log(`     - ${a.filename} — ${a.error}`);
      }
    }
    process.exit(0);
  }

  // ── Detail orphaned ───────────────────────────────────────────────
  console.log('\n📄 Daftar orphaned records:');
  for (const o of orphaned) {
    const date =
      o.createdAt instanceof Date ? o.createdAt.toISOString().slice(0, 10) : String(o.createdAt);
    console.log(`   ${o.id}  ${date}`);
    console.log(`   ${o.filename}`);
    console.log(`   ${o.url}\n`);
  }

  if (ambiguous.length > 0) {
    console.log(`\n⚠️  ${ambiguous.length} file tidak bisa diverifikasi (akan di-skip):`);
    for (const a of ambiguous) {
      console.log(`   - ${a.filename} — ${a.error}`);
    }
  }

  // ── Delete option ─────────────────────────────────────────────────
  if (shouldDelete && orphaned.length > 0) {
    if (!shouldForce) {
      console.log('⚠️  Gunakan --force untuk konfirmasi penghapusan:\n');
      console.log('   pnpm --filter @ahlipanggilan/api db:check-media --delete --force');
      process.exit(0);
    }

    console.log('🗑️  Menghapus orphaned records dari database...\n');

    for (const o of orphaned) {
      await db.delete(media).where(eq(media.id, o.id));
      console.log(`   ✅ ${o.filename} — deleted`);
    }

    console.log(`\n✨ ${orphaned.length} records berhasil dihapus.`);
  } else if (orphaned.length > 0) {
    console.log('💡 Untuk menghapus orphaned records dari database:\n');
    console.log('   pnpm --filter @ahlipanggilan/api db:check-media --delete --force\n');
    console.log('   ⚠️  Pastikan file-file ini benar-benar tidak diperlukan lagi.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Gagal:', err);
  process.exit(1);
});
