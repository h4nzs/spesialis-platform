import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

/**
 * Helper: create a published article via admin API and track its ID for cleanup.
 */
async function createArticle(
  request: Parameters<typeof loginViaApi>[0],
  auth: { token: string },
  overrides: {
    slug: string;
    content: string;
    title?: string;
    summary?: string;
    authorName?: string;
    status?: string;
  },
): Promise<{ id: string }> {
  const res = await request.post('http://localhost:3000/api/v1/admin/articles', {
    headers: { Cookie: `token=${auth.token}` },
    data: {
      title: overrides.title ?? `E2E Test Article ${Date.now()}`,
      slug: overrides.slug,
      content: overrides.content,
      summary: overrides.summary ?? 'E2E test article',
      authorName: overrides.authorName ?? 'E2E Tester',
      status: overrides.status ?? 'Published',
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { data: { id: string } };
  return body.data;
}

test.describe('Article Creation & Rendering', () => {
  const createdArticleIds: string[] = [];

  test.afterEach(async ({ request }) => {
    if (createdArticleIds.length === 0) return;
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    for (const id of createdArticleIds) {
      await request
        .delete(`http://localhost:3000/api/v1/admin/articles/${id}`, {
          headers: { Cookie: `token=${auth.token}` },
        })
        .catch(() => {});
    }
    createdArticleIds.length = 0;
  });

  test('Admin creates article with HTML content (TipTap-style) and blog renders it correctly', async ({
    page,
    request,
  }) => {
    // Login
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    expect(auth.user.role).toBe('super_admin');
    await setAuthCookie(page, auth);

    // Create article with HTML content (simulating TipTap output)
    const slug = `e2e-html-${Date.now()}`;
    const htmlContent = [
      '<p>AC adalah investasi penting untuk kenyamanan rumah. Dengan perawatan rutin, AC dapat bertahan lebih lama dan tetap efisien.</p>',
      '<h2>1. Bersihkan Filter Secara Rutin</h2>',
      '<p>Filter AC yang kotor membuat kinerja AC berat dan tagihan listrik membengkak. Bersihkan filter setiap <strong>2 minggu sekali</strong>.</p>',
      '<h2>2. Periksa Freon</h2>',
      '<p>Freon yang berkurang akan membuat AC tidak dingin. Segera hubungi <em>teknisi profesional</em> jika AC mulai terasa kurang dingin.</p>',
      '<h2>3. Servis Berkala</h2>',
      '<p>Lakukan servis besar setiap 3-6 bulan sekali oleh teknisi profesional.</p>',
      '<ul><li><p>Pembersihan evaporator</p></li><li><p>Pengecekan freon</p></li><li><p>Pembersihan kondensor</p></li></ul>',
    ].join('\n');

    const article = await createArticle(request, auth, {
      slug,
      content: htmlContent,
      title: `E2E HTML ${Date.now()}`,
    });
    createdArticleIds.push(article.id);

    // Navigate to blog article
    await page.goto(`/blog/${slug}`);
    await page.waitForLoadState('networkidle');

    // Article title should be visible
    await expect(page.locator('h1').first()).toBeAttached({ timeout: 10000 });

    // Content: headings should render as <h2> inside .prose
    const prose = page.locator('.prose');
    await expect(prose.locator('h2')).toHaveCount(3);
    await expect(prose.locator('h2').nth(0)).toContainText('Bersihkan Filter Secara Rutin');
    await expect(prose.locator('h2').nth(1)).toContainText('Periksa Freon');

    // Bold → <strong>
    await expect(prose.locator('strong')).toContainText('2 minggu sekali');

    // Italic → <em>
    await expect(prose.locator('em')).toContainText('teknisi profesional');

    // Lists → <ul><li>
    await expect(prose.locator('ul li')).toHaveCount(3);

    // No raw ## markers in prose content
    await expect(prose).not.toContainText('##');
    // No raw HTML tags shown as text
    await expect(prose.locator('text=<h2>')).toHaveCount(0);
    await expect(prose.locator('text=<strong>')).toHaveCount(0);
  });

  test('Admin creates article with Markdown content and blog renders it correctly', async ({
    page,
    request,
  }) => {
    // Login
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    await setAuthCookie(page, auth);

    // Create article with Markdown content
    const slug = `e2e-md-${Date.now()}`;
    const markdownContent = [
      'Saluran air mampet adalah masalah rumah tangga yang paling umum. Sebelum panik, coba langkah-langkah berikut:',
      '',
      '## 1. Gunakan Air Panas',
      'Tuangkan air panas secara perlahan ke saluran yang tersumbat. Air panas dapat melarutkan lemak dan sabun yang menumpuk.',
      '',
      '## 2. Baking Soda dan Cuka',
      'Campurkan **1/2 cangkir baking soda** dengan **1/2 cangkir cuka**. Tuang ke saluran dan tunggu *15 menit*, lalu siram dengan air panas.',
      '',
      '## 3. Gunakan Plunger',
      'Alat sederhana ini sangat efektif untuk mengatasi sumbatan ringan.',
      '',
      '- Gunakan plunger karet',
      '- Pastikan ada air cukup',
      '- Lakukan gerakan naik turun',
    ].join('\n');

    const article = await createArticle(request, auth, {
      slug,
      content: markdownContent,
      title: `E2E Markdown ${Date.now()}`,
    });
    createdArticleIds.push(article.id);

    // Navigate to blog article
    await page.goto(`/blog/${slug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeAttached({ timeout: 10000 });

    // Content: markdown ## → <h2> inside .prose
    const prose = page.locator('.prose');
    await expect(prose.locator('h2')).toHaveCount(3);
    await expect(prose.locator('h2').nth(0)).toContainText('Gunakan Air Panas');
    await expect(prose.locator('h2').nth(1)).toContainText('Baking Soda dan Cuka');

    // Bold ** → <strong> (two bold elements in the content)
    await expect(prose.locator('strong')).toHaveCount(2);
    await expect(prose.locator('strong').first()).toContainText('1/2 cangkir baking soda');
    await expect(prose.locator('strong').nth(1)).toContainText('1/2 cangkir cuka');

    // Italic * → <em>
    await expect(prose.locator('em')).toContainText('15 menit');

    // Lists → <ul><li>
    await expect(prose.locator('ul li')).toHaveCount(3);

    // No raw ## markers in prose content
    await expect(prose).not.toContainText('##');
  });

  test('Seed article with Markdown (cara-merawat-ac-awet) renders headings correctly', async ({
    page,
  }) => {
    await page.goto('/blog/cara-merawat-ac-awet');
    await page.waitForLoadState('networkidle');

    // If article exists, verify heading rendering
    const h1 = page.locator('h1');
    const exists = (await h1.count()) > 0;

    test.skip(
      !exists,
      'Seed data not loaded — run `pnpm --filter @ahlipanggilan/api db:seed` first',
    );

    await expect(h1).toContainText('Cara Merawat AC', { timeout: 10000 });

    // Markdown headings → <h2>
    const prose = page.locator('.prose');
    await expect(prose.locator('h2').first()).toBeVisible({ timeout: 5000 });
    // No raw ## markers
    await expect(prose).not.toContainText('##');
  });

  test('Seed article with HTML (tips-membersihkan-rumah) renders correctly', async ({ page }) => {
    await page.goto('/blog/tips-membersihkan-rumah-setelah-renovasi');
    await page.waitForLoadState('networkidle');

    // If article exists, verify heading rendering
    const h1 = page.locator('h1');
    const exists = (await h1.count()) > 0;

    test.skip(
      !exists,
      'Seed data not loaded — run `pnpm --filter @ahlipanggilan/api db:seed` first',
    );

    await expect(h1).toContainText('Tips Membersihkan Rumah', { timeout: 10000 });

    const prose = page.locator('.prose');
    await expect(prose.locator('h2').first()).toBeVisible({ timeout: 5000 });
    await expect(prose.locator('h2').nth(0)).toContainText('Bersihkan dari Atas ke Bawah');

    // No raw HTML tags
    await expect(prose.locator('text=<h2>')).toHaveCount(0);
    await expect(prose.locator('text=<p>')).toHaveCount(0);
  });
});
