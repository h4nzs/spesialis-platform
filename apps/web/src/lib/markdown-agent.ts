/**
 * Markdown for Agents — Content Negotiation Handler
 *
 * Provides markdown versions of key pages when agents request
 * them via `Accept: text/markdown`.
 *
 * See: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

interface MarkdownResponse {
  content: string;
  tokenCount: number;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for Indonesian/English text
  return Math.ceil(text.length / 4);
}

const SITE = 'https://ahlipanggilan.id';

const HOME_MD = `# Ahli Panggilan

> Platform layanan jasa profesional (on-demand service booking) di Indonesia.
> Hubungkan dengan teknisi terverifikasi untuk AC, plumbing, listrik, cleaning, dan jasa profesional lainnya.

## Quick Links

- [Book a Service](${SITE}/book)
- [Track an Order](${SITE}/tracking)
- [Browse Services](${SITE}/services)
- [Blog & Articles](${SITE}/blog)
- [FAQ](${SITE}/faq)
- [Corporate Solutions](${SITE}/corporate)
- [Become a Partner](${SITE}/partner)
- [About Us](${SITE}/tentang-kami)
- [Contact](${SITE}/kontak)
- [Privacy Policy](${SITE}/kebijakan-privasi)
- [Terms & Conditions](${SITE}/syarat-ketentuan)

## Service Categories

1. **AC Services** — Service AC, cuci AC, bongkar pasang, isi freon, perbaikan AC
2. **Electrical** — Instalasi listrik, perbaikan, panel listrik, stop kontak
3. **Plumbing** — Perbaikan pipa, water heater, pompa air, saluran mampet
4. **Cleaning** — Kebersihan rumah, kantor, apartemen
5. **Building Maintenance** — Perbaikan ringan, pengecatan, perbaikan furnitur
6. **CCTV** — Instalasi dan perbaikan CCTV
7. **Locksmith** — Buka kunci, ganti kunci, perbaikan kunci

Prices start from Rp50.000. All technicians are verified and experienced.

## Contact

- Email: hello@ahlipanggilan.id
- Hours: Mon-Sat 08:00-20:00 WIB, Sun 09:00-17:00 WIB
- Service Area: Jakarta, Bandung, Tangerang, Bekasi, Depok, Bogor (Jabodetabek)

## Agent Resources

- [Full Documentation](${SITE}/llms-full.txt) — Complete platform information
- [API Catalog](${SITE}/.well-known/api-catalog) — Machine-readable API discovery
- [Auth Guide](${SITE}/auth.md) — Authentication documentation for agents
- [MCP Server Card](${SITE}/.well-known/mcp/server-card.json) — MCP discovery metadata
- [Agent Skills](${SITE}/.well-known/agent-skills/index.json) — Available agent skills
- [Sitemap](${SITE}/sitemap.xml) — XML sitemap
`;

const ABOUT_MD = `# Tentang Ahli Panggilan

Ahli Panggilan adalah platform penyedia layanan jasa profesional (on-demand service booking) di Indonesia. Kami menghubungkan pelanggan dengan teknisi terverifikasi untuk berbagai kebutuhan rumah, kantor, dan bisnis.

## Visi

Menjadi perusahaan penyedia layanan jasa profesional terpercaya yang mendukung pertumbuhan ekonomi lokal dan meningkatkan kualitas hidup masyarakat Indonesia.

## Misi

- Menyediakan akses mudah ke layanan jasa profesional berkualitas
- Memberdayakan tenaga ahli lokal melalui sistem kerja yang adil dan transparan
- Menjamin kepuasan pelanggan melalui layanan yang cepat, terpercaya, dan bergaransi

## Nilai Kami

- **Transparan**: Harga jelas tanpa biaya tersembunyi
- **Terpercaya**: Setiap teknisi telah diverifikasi dan berpengalaman
- **Cepat**: Booking dalam hitungan menit, tanpa antre
- **Bergaransi**: Setiap layanan dilindungi garansi kepuasan

[Selengkapnya](${SITE}/tentang-kami)
`;

const CONTACT_MD = `# Kontak Ahli Panggilan

## Informasi Kontak

- **Email**: hello@ahlipanggilan.id
- **WhatsApp**: 6281234567890
- **Jam Operasional**: Senin - Sabtu: 08.00 - 20.00 WIB, Minggu: 09.00 - 17.00 WIB
- **Lokasi**: Jakarta, Indonesia
- **Area Layanan**: Jakarta, Bandung, Tangerang, Bekasi, Depok, Bogor (Jabodetabek dan Bandung)

[Selengkapnya](${SITE}/kontak)
`;

const FAQ_MD = `# FAQ — Pertanyaan Umum Ahli Panggilan

## Bagaimana cara booking layanan?
Anda dapat booking melalui website di halaman /book, pilih layanan, isi data diri, jadwal, dan alamat.

## Apakah booking bisa dilakukan tanpa login?
Ya, guest booking tersedia. Anda bisa booking tanpa perlu membuat akun.

## Bagaimana cara melacak pesanan?
Gunakan nomor booking (format: SP-XXXXX) di halaman /tracking.

## Apa saja metode pembayaran?
Transfer Bank, QRIS, E-Wallet, atau Cash.

## Apakah ada garansi layanan?
Ya, setiap layanan dilindungi garansi kepuasan.

## Bagaimana cara menjadi mitra teknisi?
Daftar gratis di /register/partner. Lengkapi data diri dan dokumen.

## Apakah ada biaya pendaftaran mitra?
Tidak ada biaya pendaftaran sama sekali.

[Selengkapnya](${SITE}/faq)
`;

const SERVICES_MD = `# Layanan Ahli Panggilan

Ahli Panggilan menyediakan berbagai layanan jasa profesional untuk kebutuhan rumah, kantor, dan bisnis:

| Kategori | Contoh Layanan | Mulai Dari |
|---|---|---|
| Perawatan AC | Service AC, cuci AC, bongkar pasang, isi freon | Rp50.000 |
| Kelistrikan | Instalasi listrik, perbaikan, panel listrik | Rp75.000 |
| Plumbing & Sanitasi | Perbaikan pipa, water heater, pompa air | Rp75.000 |
| Cleaning Service | Kebersihan rumah, kantor, apartemen | Rp100.000 |
| Perawatan Gedung | Pengecatan, perbaikan furnitur | Rp150.000 |
| CCTV | Instalasi dan perbaikan CCTV | Rp200.000 |
| Kunci | Buka kunci, ganti kunci | Rp75.000 |

Harga transparan, teknisi berpengalaman dan terverifikasi, garansi kepuasan untuk setiap layanan.

[Lihat Semua Layanan](${SITE}/services)
[Booking Sekarang](${SITE}/book)
`;

const BLOG_MD = `# Blog Ahli Panggilan

Artikel dan panduan seputar perawatan rumah, tips AC, plumbing, listrik, dan jasa profesional lainnya.

## Topik Populer

- Perawatan AC (service, cuci AC, isi freon)
- Perbaikan rumah (plumbing, listrik, bocor)
- Tips cleaning dan kebersihan
- Panduan memilih jasa profesional
- Tips menghemat biaya perawatan rumah

[Kunjungi Blog](${SITE}/blog)
`;

const CORPORATE_MD = `# Layanan Corporate Ahli Panggilan

Solusi maintenance profesional untuk perusahaan, hotel, apartemen, mall, dan perkantoran.

## Manfaat

- **Maintenance Rutin**: Jadwal perawatan berkala untuk AC, listrik, plumbing
- **Outsourcing Teknisi**: Teknisi dedicated untuk kebutuhan harian
- **SLA Garansi**: Service Level Agreement dengan response time terjamin
- **Laporan Berkala**: Laporan maintenance, biaya, dan rekomendasi secara rutin

## Layanan Corporate

1. Perawatan AC Central & Split
2. Kelistrikan Gedung
3. Plumbing & Sanitasi
4. Cleaning Service
5. Perawatan Gedung
6. Konsultasi & Audit Infrastruktur

## Cara Memulai

1. Ajukan inquiry via form
2. Tim akan menghubungi untuk diskusi
3. Sign SLA
4. Eksekusi & monitoring dengan laporan berkala

[Selengkapnya](${SITE}/corporate)
`;

const PARTNER_MD = `# Program Mitra Teknisi Ahli Panggilan

Bergabung menjadi mitra teknisi Ahli Panggilan. Pendaftaran gratis, jadwal fleksibel, pendapatan tambahan.

## Keuntungan

- **Pendapatan Tambahan**: Dapatkan penghasilan dari setiap pekerjaan
- **Jadwal Fleksibel**: Tentukan sendiri kapan ingin bekerja
- **Jangkauan Luas**: Akses ke ribuan pelanggan potensial
- **Dukungan Penuh**: Tim admin siap membantu

## Cara Mendaftar

1. Daftar di halaman pendaftaran mitra (gratis)
2. Lengkapi profil, atur keahlian dan jadwal
3. Terima pekerjaan yang sesuai
4. Selesaikan pekerjaan dan dapatkan pembayaran

Dokumen: KTP, foto profil, foto portfolio pekerjaan.

[Daftar Sekarang](${SITE}/partner)
`;

const BOOK_MD = `# Booking Layanan Ahli Panggilan

Booking layanan jasa profesional secara online. Pilih layanan yang diinginkan, isi data diri, jadwal, dan alamat.

## Cara Booking

1. Pilih kategori layanan (AC, listrik, plumbing, cleaning, dll)
2. Pilih jenis layanan spesifik
3. Isi data diri dan alamat
4. Pilih jadwal
5. Konfirmasi booking

Guest booking tersedia — tidak perlu login untuk melakukan pemesanan.
Harga transparan, teknisi berpengalaman, garansi kepuasan.

[Booking Sekarang](${SITE}/book)
`;

const TRACKING_MD = `# Lacak Pesanan Ahli Panggilan

Lacak status pesanan layanan jasa profesional menggunakan nomor booking.

Format nomor booking: SP-XXXXX (contoh: SP-12345)

Masukkan nomor booking di halaman tracking untuk melihat status real-time:
- Menunggu Konfirmasi
- Teknisi Ditetapkan
- Teknisi Menuju Lokasi
- Sedang Dikerjakan
- Selesai

[Lacak Pesanan](${SITE}/tracking)
`;

/**
 * Route-to-markdown mapping.
 * Key is the URL pathname (without trailing slash), value is the markdown.
 */
const ROUTE_MAP: Record<string, string> = {
  '/': HOME_MD,
  '/tentang-kami': ABOUT_MD,
  '/kontak': CONTACT_MD,
  '/faq': FAQ_MD,
  '/services': SERVICES_MD,
  '/blog': BLOG_MD,
  '/corporate': CORPORATE_MD,
  '/partner': PARTNER_MD,
  '/book': BOOK_MD,
  '/tracking': TRACKING_MD,
};

/**
 * Get markdown content for a given URL pathname.
 * Returns null if no markdown version is available.
 */
export function getMarkdownForPath(pathname: string): MarkdownResponse | null {
  // Normalize — remove trailing slash except for root
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const content = ROUTE_MAP[normalized];

  // Also check for partial paths (e.g., /services, /blog)
  const topLevelSegment = '/' + (normalized.split('/')[1] ?? '');

  const md = content ?? ROUTE_MAP[topLevelSegment] ?? null;
  if (!md) return null;

  return {
    content: md,
    tokenCount: estimateTokens(md),
  };
}
