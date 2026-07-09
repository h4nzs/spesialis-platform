/**
 * Directus Content Migration Script
 *
 * Migrates existing content from Hono-managed tables (articles, faq)
 * to Directus CMS collections (cms_articles, cms_faq).
 *
 * Also seeds default data for cms_pages and cms_homepage_sections.
 *
 * Usage: pnpm tsx scripts/directus-migrate-content.ts
 *
 * Prerequisites: docker compose up -d (postgres + cms must be running),
 *                pnpm cms:setup must have been run
 */

import 'dotenv/config';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const DIRECTUS_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? 'admin@example.com';
const DIRECTUS_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? 'admin123';
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://specialist:specialist@localhost:5432/specialist';

let TOKEN_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

async function loginDirectus() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DIRECTUS_EMAIL, password: DIRECTUS_PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Directus login failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as { data: { access_token: string } };
  const token = json.data.access_token;

  TOKEN_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('  ✓ Authenticated\n');
}

interface DirectusResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function directusRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<DirectusResponse<T>> {
  const url = `${DIRECTUS_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...TOKEN_HEADERS, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok && res.status !== 204) {
    const body = await res.text();
    throw new Error(`Directus API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return {};
  return res.json() as Promise<DirectusResponse<T>>;
}

/**
 * Helper: query postgres using raw SQL and return rows.
 * Uses a simple connection per query — no connection pool needed for a migration script.
 */
// lazy-import postgres — we import once then reuse the same client
let sql: Awaited<ReturnType<typeof import('postgres')>>;

async function getSql() {
  if (!sql) {
    const postgres = (await import('postgres')).default;
    sql = postgres(DATABASE_URL, { max: 1 });
  }
  return sql;
}

async function migrateArticles() {
  console.log('\n─── Migrating Articles ─────────────────────────\n');

  const _sql = await getSql();

  const existing = await directusRequest<{ slug: string }>('/items/cms_articles');
  const existingSlugs = new Set((existing.data ?? []).map((a) => a.slug));

  const rows = await _sql<Array<Record<string, unknown>>>`
    SELECT
      a.id, a.title, a.slug, a.summary, a.content,
      a.category_id, a.author_name, a.published_at, a.status
    FROM articles a
  `;

  const categories = await _sql<Array<{ id: string; name: string }>>`
    SELECT id, name FROM article_categories
  `;
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  let migrated = 0;
  for (const row of rows) {
    if (existingSlugs.has(row.slug as string)) {
      console.log(`  - ${row.slug}: already exists, skipping`);
      continue;
    }

    const payload: Record<string, unknown> = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      content: row.content,
      category: row.category_id ? (categoryMap.get(row.category_id as string) ?? null) : null,
      author: row.author_name,
      published_at: row.published_at ? new Date(row.published_at as string).toISOString() : null,
      status: row.status ?? 'draft',
    };

    try {
      await directusRequest('/items/cms_articles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`  ✓ ${row.slug}: migrated`);
      migrated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${row.slug}: failed — ${message}`);
    }
  }

  console.log(`\n  ${migrated} articles migrated, ${rows.length - migrated} already existing`);
}

async function migrateFaq() {
  console.log('\n─── Migrating FAQ ──────────────────────────────\n');

  const _sql = await getSql();

  const existing = await directusRequest<{ question: string }>('/items/cms_faq');
  const existingQuestions = new Set((existing.data ?? []).map((f) => f.question));

  const rows = await _sql<Array<Record<string, unknown>>>`
    SELECT id, question, answer, category, display_order
    FROM faq
    ORDER BY display_order ASC
  `;

  let migrated = 0;
  for (const row of rows) {
    if (existingQuestions.has(row.question as string)) {
      console.log(`  - "${(row.question as string).slice(0, 40)}...": already exists, skipping`);
      continue;
    }

    const payload: Record<string, unknown> = {
      question: row.question,
      answer: row.answer ?? '',
      category: row.category,
      sort: row.display_order ?? 0,
    };

    try {
      await directusRequest('/items/cms_faq', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`  ✓ "${(row.question as string).slice(0, 40)}..."`);
      migrated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ "${(row.question as string).slice(0, 40)}..." — ${message}`);
    }
  }

  console.log(`\n  ${migrated} FAQ items migrated, ${rows.length - migrated} already existing`);
}

async function seedPages() {
  console.log('\n─── Seeding Pages ─────────────────────────────\n');

  const pages: Array<Record<string, unknown>> = [
    {
      title: 'Tentang Kami',
      slug: 'tentang-kami',
      content:
        '<h2>Siapa Spesialis?</h2><p>Spesialis adalah platform layanan jasa profesional on-demand di Indonesia. Kami menghubungkan pelanggan dengan teknisi dan profesional terpercaya untuk kebutuhan rumah, kantor, dan bisnis.</p><h2>Visi</h2><p>Menjadi platform jasa terdepan yang memberikan kemudahan akses layanan profesional berkualitas bagi seluruh masyarakat Indonesia.</p><h2>Misi</h2><ul><li>Menyediakan layanan jasa profesional yang terpercaya dan berkualitas</li><li>Memberikan pengalaman booking yang mudah dan transparan</li><li>Memberdayakan mitra profesional lokal</li><li>Menciptakan ekosistem jasa yang adil dan berkelanjutan</li></ul>',
      meta: '{"title":"Tentang Kami - Spesialis","description":"Platform layanan jasa profesional on-demand di Indonesia."}',
    },
    {
      title: 'Syarat & Ketentuan',
      slug: 'syarat-ketentuan',
      content:
        '<h1>Syarat & Ketentuan</h1><p>Dengan menggunakan layanan Spesialis, Anda menyetujui syarat dan ketentuan berikut.</p><h2>1. Definisi</h2><p>Spesialis adalah platform yang mempertemukan pengguna jasa dengan penyedia jasa profesional.</p><h2>2. Pengguna</h2><p>Pengguna wajib memberikan informasi yang akurat dan bertanggung jawab atas penggunaan akun.</p><h2>3. Pembayaran</h2><p>Seluruh pembayaran dilakukan melalui platform sesuai dengan harga yang telah disepakati.</p><h2>4. Pembatalan</h2><p>Pembatalan dapat dilakukan sesuai dengan kebijakan yang berlaku pada masing-masing layanan.</p>',
      meta: '{"title":"Syarat & Ketentuan - Spesialis"}',
    },
    {
      title: 'Kebijakan Privasi',
      slug: 'kebijakan-privasi',
      content:
        '<h1>Kebijakan Privasi</h1><p>Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.</p><h2>Data yang Dikumpulkan</h2><p>Kami mengumpulkan data yang Anda berikan saat mendaftar dan menggunakan layanan, termasuk nama, email, nomor telepon, dan alamat.</p><h2>Penggunaan Data</h2><p>Data Anda digunakan untuk memproses layanan, komunikasi, dan peningkatan platform.</p><h2>Perlindungan Data</h2><p>Kami menerapkan langkah-langkah keamanan untuk melindungi data pribadi Anda.</p>',
      meta: '{"title":"Kebijakan Privasi - Spesialis"}',
    },
    {
      title: 'Kontak',
      slug: 'kontak',
      content:
        '<h1>Hubungi Kami</h1><p>Tim Spesialis siap membantu Anda.</p><p>Email: hello@spesialis.id</p><p>Jam Operasional: Senin - Sabtu (08.00 - 20.00 WIB), Minggu (09.00 - 17.00 WIB)</p>',
      meta: '{"title":"Kontak - Spesialis"}',
    },
  ];

  const existing = await directusRequest<{ slug: string }>('/items/cms_pages');
  const existingSlugs = new Set((existing.data ?? []).map((p) => p.slug));

  let seeded = 0;
  for (const page of pages) {
    if (existingSlugs.has(page.slug as string)) {
      console.log(`  - ${page.slug}: already exists, skipping`);
      continue;
    }

    try {
      await directusRequest('/items/cms_pages', {
        method: 'POST',
        body: JSON.stringify(page),
      });
      console.log(`  ✓ ${page.slug}: seeded`);
      seeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${page.slug}: failed — ${message}`);
    }
  }

  console.log(`\n  ${seeded} pages seeded, ${pages.length - seeded} already existing`);
}

async function seedHomepageSections() {
  console.log('\n─── Seeding Homepage Sections ──────────────────\n');

  // Seed content matches the current hardcoded text in homepage components.
  // Edit these values in Directus Admin → Content → Homepage Sections to update the site.
  const sections: Array<Record<string, unknown>> = [
    {
      section_type: 'hero',
      title: 'Layanan Profesional <span class="text-primary-500">Tanpa Ribet</span>',
      content:
        'Temukan teknisi dan profesional terpercaya untuk kebutuhan rumah, kantor, dan bisnis Anda. Booking dalam hitungan menit.',
      sort_order: 1,
      is_active: true,
    },
    {
      section_type: 'services',
      title: 'Layanan Kami',
      content: 'Dari AC, plumbing, listrik, hingga cleaning — semua tersedia dalam satu platform.',
      sort_order: 2,
      is_active: true,
    },
    {
      section_type: 'why-us',
      title: 'Mengapa Memilih Kami',
      content:
        'Kami hadir untuk memberikan pengalaman layanan jasa yang berbeda — lebih cepat, lebih transparan, lebih terpercaya.',
      sort_order: 3,
      is_active: true,
    },
    {
      section_type: 'stats',
      title: null,
      content: null,
      sort_order: 4,
      is_active: true,
    },
    {
      section_type: 'cta',
      title: 'Siap Memesan Layanan Profesional?',
      content:
        'Booking sekarang dan dapatkan teknisi terpercaya untuk kebutuhan Anda. Proses cepat, harga transparan.',
      sort_order: 5,
      is_active: true,
    },
  ];

  const existing = await directusRequest<{ section_type: string }>('/items/cms_homepage_sections');
  const existingTypes = new Set((existing.data ?? []).map((s) => s.section_type));

  let seeded = 0;
  for (const section of sections) {
    if (existingTypes.has(section.section_type as string)) {
      console.log(`  - ${section.section_type}: already exists, skipping`);
      continue;
    }

    try {
      await directusRequest('/items/cms_homepage_sections', {
        method: 'POST',
        body: JSON.stringify(section),
      });
      console.log(`  ✓ ${section.section_type}: seeded`);
      seeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${section.section_type}: failed — ${message}`);
    }
  }

  console.log(`\n  ${seeded} sections seeded, ${sections.length - seeded} already existing`);
}

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Directus Content Migration');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  Target: ${DIRECTUS_URL}\n`);

  // Verify Directus is reachable
  try {
    const res = await fetch(`${DIRECTUS_URL}/server/info`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    console.log('  ✓ Directus is reachable\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Could not reach Directus at ${DIRECTUS_URL}: ${message}`);
    console.error('\n  Make sure Directus is running:');
    console.error('    docker compose up cms -d\n');
    process.exit(1);
  }

  // Authenticate
  await loginDirectus();

  await migrateArticles();
  await migrateFaq();
  await seedPages();
  await seedHomepageSections();

  const _sql = await getSql();
  await _sql.end();

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Content migration complete!');
  console.log('═══════════════════════════════════════════\n');
  console.log('  CMS Admin: http://localhost:8055/admin\n');
  console.log('  What was done:');
  console.log('    - Migrated articles → cms_articles');
  console.log('    - Migrated FAQ → cms_faq');
  console.log('    - Seeded default pages → cms_pages');
  console.log('    - Seeded homepage sections → cms_homepage_sections\n');
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('\n❌ Migration failed:', message);
  process.exit(1);
});
