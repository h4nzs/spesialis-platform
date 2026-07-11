/**
 * Seed CMS Pages
 *
 * Mengisi tabel cms_pages dengan 4 halaman sistem default:
 * - Tentang Kami
 * - Syarat & Ketentuan
 * - Kebijakan Privasi
 * - Hubungi Kami (Kontak)
 *
 * Konten diambil dari hardcoded fallback di file Astro masing-masing,
 * dengan Tailwind CSS classes dihapus karena .prose menangani styling.
 *
 * Cara pakai: tsx scripts/seed-cms-pages.ts
 */

import { db } from './client.ts';
import { cmsPages } from './schema/cms-pages.ts';
import { eq } from 'drizzle-orm';

// ── Helpers ────────────────────────────────────────────────────────

/** Hapus semua atribut class dari HTML tags */
function stripClasses(html: string): string {
  return html.replace(/\s*class="[^"]*"/g, '');
}

// ── Data halaman ───────────────────────────────────────────────────

const PAGES = [
  {
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    status: 'Published',
    content: stripClasses(`
<p>
  Spesialis adalah platform layanan jasa profesional on-demand yang menghubungkan pelanggan
  dengan teknisi dan profesional terpercaya di Indonesia. Kami hadir untuk mempermudah
  Anda menemukan tenaga ahli untuk kebutuhan rumah, kantor, dan bisnis.
</p>

<h2>Visi</h2>
<p>
  Menjadi platform layanan jasa profesional terpercaya yang mendukung pertumbuhan ekonomi
  lokal dan meningkatkan kualitas hidup masyarakat Indonesia.
</p>

<h2>Misi</h2>
<ul>
  <li>Menyediakan akses mudah ke layanan jasa profesional berkualitas.</li>
  <li>Memberdayakan mitra teknisi lokal melalui platform yang adil dan transparan.</li>
  <li>Menjamin kepuasan pelanggan melalui layanan yang cepat, terpercaya, dan bergaransi.</li>
  <li>Mendukung pertumbuhan bisnis perusahaan melalui solusi maintenance dan outsourcing.</li>
</ul>

<h2>Nilai Kami</h2>
<div>
  <div>
    <h3>Transparan</h3>
    <p>Harga jelas tanpa biaya tersembunyi.</p>
  </div>
  <div>
    <h3>Terpercaya</h3>
    <p>Setiap mitra telah diverifikasi dan berpengalaman.</p>
  </div>
  <div>
    <h3>Cepat</h3>
    <p>Booking dalam hitungan menit, tanpa antre.</p>
  </div>
  <div>
    <h3>Bergaransi</h3>
    <p>Setiap layanan dilindungi garansi kepuasan.</p>
  </div>
</div>
    `),
    meta: {
      description:
        'Spesialis adalah platform layanan jasa profesional on-demand yang menghubungkan pelanggan dengan teknisi terpercaya di Indonesia.',
    },
  },
  {
    title: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    status: 'Published',
    content: stripClasses(`
<p>Terakhir diperbarui: Juli 2026</p>

<h2>1. Layanan</h2>
<p>
  Spesialis adalah platform yang menghubungkan pelanggan dengan penyedia jasa profesional. Kami hanya menyediakan platform &mdash; pelaksanaan layanan dilakukan sepenuhnya oleh mitra penyedia jasa.
</p>

<h2>2. Penggunaan Platform</h2>
<p>
  Dengan menggunakan platform Spesialis, Anda menyetujui untuk memberikan informasi yang akurat, tidak menyalahgunakan platform, dan mematuhi seluruh ketentuan yang berlaku.
</p>

<h2>3. Pembayaran</h2>
<p>
  Pembayaran dilakukan sesuai kesepakatan antara pelanggan dan penyedia jasa. Spesialis tidak memproses pembayaran secara langsung pada fase MVP. Semua transaksi dilakukan secara manual.
</p>

<h2>4. Pembatalan</h2>
<p>
  Pelanggan dapat membatalkan pesanan sebelum pekerjaan dimulai. Pembatalan dapat dilakukan melalui dashboard atau dengan menghubungi tim Spesialis.
</p>

<h2>5. Garansi</h2>
<p>
  Setiap layanan memiliki garansi sesuai dengan ketentuan yang tertera pada halaman layanan. Klaim garansi dapat diajukan melalui fitur komplain di dashboard pelanggan.
</p>

<h2>6. Privasi</h2>
<p>
  Kami menghormati privasi Anda. Data pribadi Anda dikelola sesuai dengan Kebijakan Privasi yang terpisah. Kami tidak akan membagikan data Anda tanpa persetujuan.
</p>
    `),
    meta: {
      description: 'Syarat dan ketentuan penggunaan platform layanan jasa profesional Spesialis.',
    },
  },
  {
    title: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    status: 'Published',
    content: stripClasses(`
<p>Terakhir diperbarui: Juli 2026</p>

<h2>1. Data yang Dikumpulkan</h2>
<p>
  Kami mengumpulkan data yang Anda berikan secara langsung: nama, nomor telepon, alamat email, alamat, dan informasi lain yang diperlukan untuk pemesanan layanan.
</p>

<h2>2. Penggunaan Data</h2>
<p>
  Data Anda digunakan untuk: memproses pemesanan, menghubungi Anda terkait layanan, mengirimkan informasi penting, dan meningkatkan kualitas layanan kami.
</p>

<h2>3. Perlindungan Data</h2>
<p>
  Kami menerapkan langkah-langkah keamanan teknis untuk melindungi data Anda, termasuk enkripsi password menggunakan algoritma Argon2id, HTTPS, dan akses terbatas berdasarkan peran (RBAC).
</p>

<h2>4. Berbagi Data</h2>
<p>
  Data Anda hanya dibagikan dengan mitra penyedia jasa yang ditugaskan untuk pesanan Anda. Kami tidak menjual data Anda kepada pihak ketiga.
</p>

<h2>5. Hak Anda</h2>
<p>
  Anda berhak untuk mengakses, memperbaiki, atau menghapus data pribadi Anda kapan saja melalui dashboard akun. Untuk penghapusan akun permanen, hubungi tim kami.
</p>

<h2>6. Kontak</h2>
<p>
  Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui halaman kontak atau email.
</p>
    `),
    meta: {
      description:
        'Kebijakan privasi platform layanan jasa profesional Spesialis. Bagaimana kami mengelola dan melindungi data pribadi Anda.',
    },
  },
  {
    title: 'Hubungi Kami',
    slug: 'kontak',
    status: 'Published',
    content: stripClasses(`
<div>
  <div>
    <h2>Email</h2>
    <p><a href="mailto:hello@ahlipanggilan.id">hello@ahlipanggilan.id</a></p>
  </div>
  <div>
    <h2>WhatsApp</h2>
    <p><a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">+62 812-3456-7890</a></p>
  </div>
  <div>
    <h2>Jam Operasional</h2>
    <p>
      Senin &mdash; Sabtu: 08.00 &mdash; 20.00 WIB<br />
      Minggu: 09.00 &mdash; 17.00 WIB
    </p>
  </div>
  <div>
    <h2>Lokasi</h2>
    <p>Jakarta, Indonesia</p>
  </div>
</div>
    `),
    meta: {
      description:
        'Hubungi tim Spesialis untuk pertanyaan, kritik, saran, atau kerjasama. Kami siap membantu Anda.',
    },
  },
];

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding CMS pages...\n');

  let inserted = 0;
  let skipped = 0;

  for (const page of PAGES) {
    // Cek apakah slug sudah ada
    const [existing] = await db
      .select({ id: cmsPages.id })
      .from(cmsPages)
      .where(eq(cmsPages.slug, page.slug))
      .limit(1);

    if (existing) {
      console.log(`  ⏭️  ${page.slug} — sudah ada, skip`);
      skipped++;
      continue;
    }

    await db.insert(cmsPages).values({
      title: page.title,
      slug: page.slug,
      content: page.content,
      meta: page.meta as Record<string, unknown>,
      status: 'Published',
    });

    console.log(`  ✅ ${page.slug} — berhasil di-seed`);
    inserted++;
  }

  console.log(`\n✨ Selesai! ${inserted} baru, ${skipped} sudah ada.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Gagal seed CMS pages:', err);
  process.exit(1);
});
