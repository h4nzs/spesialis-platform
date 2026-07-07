import { Hono } from 'hono';
import { success } from '../lib/response.ts';
import { cms, type CmsHomepageSection, type CmsPage } from '../lib/cms.ts';

const cmsRouter = new Hono();

cmsRouter.get('/faq', async (c) => {
  try {
    const items = await cms.faq.list();
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 50;
    const items = await cms.articles.list({ limit });
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const items = await cms.articles.bySlug(slug);
    const item = items?.[0] ?? null;
    return success(c, item);
  } catch {
    return success(c, null);
  }
});

/** Fallback homepage sections used when Directus CMS is unavailable */
const FALLBACK_HOMEPAGE_SECTIONS: CmsHomepageSection[] = [
  {
    id: 'fallback-hero',
    section_type: 'hero',
    title: 'Layanan Profesional Tanpa Ribet',
    content:
      'Temukan teknisi dan profesional terpercaya untuk kebutuhan rumah, kantor, dan bisnis Anda.',
    image: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'fallback-services',
    section_type: 'services',
    title: 'Layanan Kami',
    content: 'Dari AC, plumbing, listrik, hingga cleaning — semua tersedia dalam satu platform.',
    image: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'fallback-why-us',
    section_type: 'why-us',
    title: 'Kenapa Spesialis?',
    content:
      'Teknisi berpengalaman, booking mudah, garansi layanan, dan harga transparan tanpa biaya tersembunyi.',
    image: null,
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'fallback-stats',
    section_type: 'stats',
    title: null,
    content: null,
    image: null,
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'fallback-cta',
    section_type: 'cta',
    title: 'Siap Memesan?',
    content: 'Booking sekarang dan dapatkan layanan profesional terbaik dari ahlinya.',
    image: null,
    sort_order: 5,
    is_active: true,
  },
];

cmsRouter.get('/homepage-sections', async (c) => {
  try {
    const items = await cms.homepageSections.list();
    if (items.length > 0) {
      return success(c, items);
    }
    // CMS is available but has no sections — use fallback
    return success(c, FALLBACK_HOMEPAGE_SECTIONS);
  } catch {
    // CMS is unreachable — use fallback
    return success(c, FALLBACK_HOMEPAGE_SECTIONS);
  }
});

/** Fallback pages used when Directus CMS is unavailable */
const FALLBACK_PAGES: Record<string, CmsPage> = {
  'tentang-kami': {
    id: 'fallback-tentang-kami',
    title: 'Tentang Kami',
    slug: 'tentang-kami',
    content:
      '# Tentang Spesialis\n\nSpesialis adalah platform layanan jasa profesional on-demand yang menghubungkan pelanggan dengan teknisi dan profesional terpercaya.\n\n## Misi Kami\n\nMempermudah masyarakat Indonesia mendapatkan layanan jasa profesional yang berkualitas, transparan, dan terpercaya.\n\n## Visi Kami\n\nMenjadi platform layanan jasa profesional terdepan di Indonesia yang membantu jutaan pelanggan setiap hari.\n\n## Nilai-Nilai Kami\n\n- **Kepercayaan** — Setiap mitra telah diverifikasi dan memiliki rekam jejak yang jelas.\n- **Transparansi** — Harga jelas tanpa biaya tersembunyi.\n- **Kualitas** — Garansi layanan untuk setiap pekerjaan.\n- **Kemudahan** — Booking dalam hitungan menit, kapan pun dan di mana pun.',
    meta: {
      title: 'Tentang Kami - Spesialis',
      description:
        'Pelajari lebih lanjut tentang Spesialis, platform layanan jasa profesional on-demand di Indonesia.',
    },
  },
  'syarat-ketentuan': {
    id: 'fallback-syarat-ketentuan',
    title: 'Syarat & Ketentuan',
    slug: 'syarat-ketentuan',
    content:
      '# Syarat & Ketentuan\n\n## 1. Layanan\nSpesialis menyediakan platform yang menghubungkan pelanggan dengan penyedia jasa profesional. Kami bukan penyedia jasa langsung, melainkan perantara yang memfasilitasi transaksi.\n\n## 2. Booking\nDengan melakukan booking, pelanggan setuju untuk dihubungi oleh tim Spesialis melalui WhatsApp untuk konfirmasi dan negosiasi harga.\n\n## 3. Pembayaran\nPembayaran dilakukan setelah pekerjaan selesai. Metode pembayaran meliputi transfer bank, tunai, QRIS, dan e-wallet.\n\n## 4. Pembatalan\nPelanggan dapat membatalkan order sebelum pekerjaan dimulai. Admin berhak membatalkan order jika terjadi pelanggaran ketentuan.\n\n## 5. Garansi\nSetiap layanan dilengkapi garansi sesuai dengan jenis layanan. Klaim garansi dapat diajukan melalui fitur komplain di dashboard.',
    meta: {
      title: 'Syarat & Ketentuan - Spesialis',
      description: 'Syarat dan ketentuan penggunaan layanan Spesialis.',
    },
  },
  'kebijakan-privasi': {
    id: 'fallback-kebijakan-privasi',
    title: 'Kebijakan Privasi',
    slug: 'kebijakan-privasi',
    content:
      '# Kebijakan Privasi\n\n## 1. Data yang Dikumpulkan\nKami mengumpulkan data yang Anda berikan saat mendaftar atau melakukan booking, termasuk nama, email, nomor telepon, dan alamat.\n\n## 2. Penggunaan Data\nData Anda digunakan untuk memproses booking, menghubungi Anda terkait layanan, dan meningkatkan kualitas platform kami.\n\n## 3. Keamanan Data\nKami menerapkan langkah-langkah keamanan teknis untuk melindungi data pribadi Anda dari akses tidak sah.\n\n## 4. Hak Anda\nAnda berhak mengakses, mengoreksi, atau menghapus data pribadi Anda kapan saja melalui pengaturan akun.',
    meta: {
      title: 'Kebijakan Privasi - Spesialis',
      description: 'Kebijakan privasi penggunaan layanan Spesialis.',
    },
  },
  kontak: {
    id: 'fallback-kontak',
    title: 'Kontak',
    slug: 'kontak',
    content:
      '# Hubungi Kami\n\n## WhatsApp\nHubungi tim kami melalui WhatsApp untuk pertanyaan, konsultasi, atau bantuan.\n\n## Email\nKirim email ke **halo@spesialis.id** untuk pertanyaan umum dan kerja sama.\n\n## Jam Operasional\nSenin - Sabtu: 08.00 - 20.00\nMinggu: 09.00 - 17.00\n\nKami siap membantu Anda!',
    meta: {
      title: 'Kontak - Spesialis',
      description: 'Hubungi tim Spesialis untuk pertanyaan, konsultasi, atau bantuan.',
    },
  },
};

cmsRouter.get('/pages/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const items = await cms.pages.bySlug(slug);
    const item = items?.[0] ?? null;
    if (item) return success(c, item);
  } catch {
    // CMS is unreachable — fall through to fallback
  }
  // Fallback: return hardcoded content for known pages, null otherwise
  return success(c, FALLBACK_PAGES[slug] ?? null);
});

export { cmsRouter };
