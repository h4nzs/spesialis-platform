/**
 * Seed CMS Testimonials
 *
 * Mengisi tabel cms_testimonials dengan data awal agar homepage
 * dan halaman partner menampilkan testimoni dari database, bukan
 * dari fallback hardcoded.
 *
 * Data diambil dari FALLBACK_TESTIMONIALS yang ada di:
 * - apps/web/src/components/homepage/Testimonials.astro  (customer)
 * - apps/web/src/pages/partner.astro                      (mitra)
 *
 * Cara pakai: pnpm --filter @ahlipanggilan/database db:seed-testimonials
 */

import { db } from './client.ts';
import { cmsTestimonials } from './schema/cms-testimonials.ts';
import { eq } from 'drizzle-orm';

interface TestimonialSeed {
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  rating: string;
  displayOrder: number;
}

const TESTIMONIALS: TestimonialSeed[] = [
  // ── Customer Testimonials (homepage) ──
  {
    name: 'Rina Wijaya',
    location: 'Jakarta Selatan',
    role: null,
    quote:
      'Teknisinya datang tepat waktu, pekerjaan rapi, dan harga sesuai estimasi. Sangat puas dengan layanan AC cleaning-nya.',
    rating: '5',
    displayOrder: 0,
  },
  {
    name: 'Bambang Sutrisno',
    location: 'Bandung',
    role: null,
    quote:
      'Langganan maintenance rutin untuk kantor. Timnya profesional, cepat tanggap, dan selalu komunikatif. Highly recommended!',
    rating: '5',
    displayOrder: 1,
  },
  {
    name: 'Dewi Lestari',
    location: 'Tangerang',
    role: null,
    quote:
      'Pipa bocor tengah malam, tapi admin respon cepat dan teknisi datang dalam 2 jam. Thank you Ahli Panggilan!',
    rating: '5',
    displayOrder: 2,
  },
  // ── Partner Testimonials (halaman partner) ──
  {
    name: 'Agus Prasetyo',
    location: 'Jakarta',
    role: 'Teknisi AC',
    quote:
      'Sejak bergabung, pesanan terus mengalir. Penghasilan saya jadi lebih stabil dan saya bisa atur jadwal sendiri.',
    rating: '5',
    displayOrder: 3,
  },
  {
    name: 'Doni Firmansyah',
    location: 'Bandung',
    role: 'Tukang Listrik',
    quote:
      'Proses verifikasi cepat, tim admin komunikatif, dan pelanggannya jelas. Sangat cocok untuk teknisi mandiri.',
    rating: '5',
    displayOrder: 4,
  },
  {
    name: 'Hendra Gunawan',
    location: 'Tangerang',
    role: 'Teknisi Plumbing',
    quote:
      'Awalnya ragu, tapi setelah 3 bulan penghasilan saya naik 40%. Sistemnya transparan, cocok buat saya.',
    rating: '5',
    displayOrder: 5,
  },
];

async function main() {
  console.log('🌱 Seeding CMS testimonials...\n');

  let inserted = 0;
  let skipped = 0;

  for (const t of TESTIMONIALS) {
    // Cek apakah testimoni dengan nama yang sama sudah ada
    const [existing] = await db
      .select({ id: cmsTestimonials.id })
      .from(cmsTestimonials)
      .where(eq(cmsTestimonials.name, t.name))
      .limit(1);

    if (existing) {
      console.log(`  ⏭️  ${t.name} — sudah ada, skip`);
      skipped++;
      continue;
    }

    await db.insert(cmsTestimonials).values({
      name: t.name,
      location: t.location,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
      displayOrder: t.displayOrder,
      isActive: 'true',
    });

    console.log(`  ✅ ${t.name} — berhasil di-seed`);
    inserted++;
  }

  console.log(`\n✨ Selesai! ${inserted} baru, ${skipped} sudah ada.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Gagal seed CMS testimonials:', err);
  process.exit(1);
});
