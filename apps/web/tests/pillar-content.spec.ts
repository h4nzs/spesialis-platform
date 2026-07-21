import { test, expect, type APIRequestContext } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

let adminAuth: Awaited<ReturnType<typeof loginViaApi>>;
let createdPillarArticleId: string;
let createdPillarSlug: string;
let createdClusterArticleId: string;

// ── Setup ────────────────────────────────────────────────────────

test.beforeAll(async ({ request }) => {
  adminAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );
});

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await setAuthCookie(page, adminAuth);
});

/**
 * Helper: create a pillar article via API, store ID and slug for downstream tests.
 */
async function ensurePillarArticle(request: APIRequestContext) {
  if (createdPillarArticleId) return;
  const slug = `e2e-pillar-${Date.now()}`;
  const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
    data: {
      title: 'E2E Pillar Content Article',
      slug,
      content: '<p>This is an E2E test pillar article with some content for testing.</p>',
      summary: 'E2E pillar article summary',
      authorName: 'E2E Bot',
      status: 'Published',
      isPillarContent: true,
      tags: ['AC', 'perawatan', 'pendingin'],
    },
  });
  expect(res.status()).toBe(201);
  const body = (await res.json()) as {
    data: { id: string; slug: string; isPillarContent: boolean };
  };
  createdPillarArticleId = body.data.id;
  createdPillarSlug = body.data.slug;
}

/**
 * Helper: create a cluster article via API.
 */
async function ensureClusterArticle(request: APIRequestContext) {
  if (createdClusterArticleId) return;
  if (!createdPillarSlug) await ensurePillarArticle(request);
  const slug = `e2e-cluster-${Date.now()}`;
  const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
    data: {
      title: 'E2E Cluster Article With Pillar Link',
      slug,
      content: `<p>This cluster article links to pillar content: <a href="/blog/${createdPillarSlug}">Baca panduan AC lengkap</a>. Additional content about AC maintenance.</p>`,
      summary: 'E2E cluster article with valid link',
      authorName: 'E2E Bot',
      status: 'Published',
      isPillarContent: false,
      tags: ['AC', 'tips'],
    },
  });
  expect(res.status()).toBe(201);
  const body = (await res.json()) as { data: { id: string; slug: string } };
  createdClusterArticleId = body.data.id;
}

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-23: Pillar Content Checkbox di ArticleEditor
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-23: Pillar Content Checkbox di ArticleEditor', () => {
  test('Checkbox "Jadikan sebagai Content Pillar" muncul di sidebar editor artikel baru', async ({
    page,
  }) => {
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // Verify the checkbox label is visible
    const checkboxLabel = page.locator('label', { hasText: 'Jadikan sebagai Content Pillar' });
    await expect(checkboxLabel).toBeVisible({ timeout: 15000 });

    // Verify the checkbox input exists inside the label
    const checkbox = checkboxLabel.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
  });

  test('API menyimpan isPillarContent=true saat artikel disimpan dengan checkbox dicentang', async ({
    request,
  }) => {
    const slug = `e2e-checkbox-test-${Date.now()}`;
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: {
        title: 'E2E Pillar Checkbox Test',
        slug,
        content: '<p>Test content for pillar checkbox verification.</p>',
        status: 'Draft',
        isPillarContent: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { data: { isPillarContent: boolean; id: string } };
    expect(body.data.isPillarContent).toBe(true);

    // Cleanup
    await request.delete(`${API_URL}/api/v1/admin/articles/${body.data.id}`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
  });

  test('API menyimpan isPillarContent=false secara default', async ({ request }) => {
    const slug = `e2e-nonpillar-${Date.now()}`;
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: {
        title: 'E2E Non-Pillar Article',
        slug,
        content: '<p>Regular article without pillar flag.</p>',
        status: 'Draft',
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { data: { isPillarContent: boolean; id: string } };
    expect(body.data.isPillarContent).toBe(false);

    // Cleanup
    await request.delete(`${API_URL}/api/v1/admin/articles/${body.data.id}`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
  });

  test('Info text muncul saat checkbox dicentang', async ({ page, request }) => {
    await ensurePillarArticle(request);

    // Navigate to edit that article
    await page.goto(`/dashboard/admin/articles/edit/${createdPillarArticleId}`);
    await page.waitForLoadState('networkidle');

    // Verify the info text is visible for pillar content
    const infoText = page.locator('text=Artikel ini akan menjadi artikel pilar utama');
    await expect(infoText).toBeVisible({ timeout: 15000 });
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-24: Sitemap Priority Boost
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-24: Sitemap Priority Boost untuk Pillar Content', () => {
  test('Sitemap XML mengandung priority 1.0 untuk pillar content', async ({ request }) => {
    await ensurePillarArticle(request);

    // Fetch sitemap.xml
    const res = await request.get('http://localhost:4321/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    // Verify pillar article has priority 1.0
    expect(xml).toContain(`<loc>https://ahlipanggilan.id/blog/${createdPillarSlug}</loc>`);
    expect(xml).toContain('<priority>1.0</priority>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
  });

  test('Artikel biasa tidak mendapat priority 1.0 di sitemap', async ({ request }) => {
    // Create a regular (non-pillar) article
    const slug = `e2e-regular-${Date.now()}`;
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: {
        title: 'E2E Regular Sitemap Test',
        slug,
        content: '<p>Regular article.</p>',
        status: 'Published',
        isPillarContent: false,
      },
    });
    expect(res.status()).toBe(201);
    const regArticle = (await res.json()) as { data: { id: string } };

    // Fetch sitemap.xml
    const sitemapRes = await request.get('http://localhost:4321/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const xml = await sitemapRes.text();

    // Regular articles should have 0.7 priority
    expect(xml).toContain(`<loc>https://ahlipanggilan.id/blog/${slug}</loc>`);
    expect(xml).toContain('<priority>0.7</priority>');

    // Cleanup
    await request.delete(`${API_URL}/api/v1/admin/articles/${regArticle.data.id}`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-25: CollectionPage JSON-LD Auto-inject
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-25: CollectionPage JSON-LD Auto-inject', () => {
  test('Pillar article detail page mengandung CollectionPage schema', async ({ request }) => {
    await ensurePillarArticle(request);

    // Fetch the published article page — use Astro dev server
    const pageRes = await request.get(`http://localhost:4321/blog/${createdPillarSlug}`);
    expect(pageRes.status()).toBe(200);
    const html = await pageRes.text();

    // Verify CollectionPage schema exists in JSON-LD
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"mainEntity"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"inLanguage":"id-ID"');
    expect(html).toContain('"about"');
  });

  test('Regular article page TIDAK mengandung CollectionPage schema', async ({ request }) => {
    const slug = `e2e-reg-jsonld-${Date.now()}`;
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: {
        title: 'E2E Regular JSON-LD Test',
        slug,
        content: '<p>Regular article without pillar.</p>',
        status: 'Published',
        isPillarContent: false,
      },
    });
    expect(res.status()).toBe(201);
    const art = (await res.json()) as { data: { id: string } };

    // Fetch article page
    const pageRes = await request.get(`http://localhost:4321/blog/${slug}`);
    expect(pageRes.status()).toBe(200);
    const html = await pageRes.text();

    // Should NOT contain CollectionPage
    expect(html).not.toContain('"@type":"CollectionPage"');

    // Cleanup
    await request.delete(`${API_URL}/api/v1/admin/articles/${art.data.id}`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-26: Link Suggestion Engine API
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-26: Link Suggestion Engine', () => {
  test('API suggestions mengembalikan array dengan relevanceScore', async ({ request }) => {
    await ensurePillarArticle(request);
    await ensureClusterArticle(request);

    const res = await request.get(
      `${API_URL}/api/v1/admin/articles/suggestions?articleId=${createdClusterArticleId}`,
      {
        headers: { Authorization: `Bearer ${adminAuth.token}` },
      },
    );
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: Array<{ title: string; relevanceScore: number }> };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    // Each suggestion should have the expected fields
    const suggestion = body.data[0]!;
    expect(suggestion.title).toBeTruthy();
    expect(typeof suggestion.relevanceScore).toBe('number');
    expect(suggestion.relevanceScore).toBeGreaterThanOrEqual(0);

    // Verify the pillar article is suggested
    const pillarSuggested = body.data.some((s: { title: string }) =>
      s.title.includes('E2E Pillar'),
    );
    expect(pillarSuggested).toBe(true);
  });

  test('API suggestions mengembalikan suggestedAnchor dan reason', async ({ request }) => {
    await ensureClusterArticle(request);

    const res = await request.get(
      `${API_URL}/api/v1/admin/articles/suggestions?articleId=${createdClusterArticleId}`,
      {
        headers: { Authorization: `Bearer ${adminAuth.token}` },
      },
    );
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: Array<{ suggestedAnchor: string; reason: string }>;
    };

    if (body.data.length > 0) {
      const suggestion = body.data[0]!;
      expect(typeof suggestion.suggestedAnchor).toBe('string');
      expect(suggestion.suggestedAnchor.length).toBeGreaterThan(0);
      expect(typeof suggestion.reason).toBe('string');
      expect(suggestion.reason.length).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-27: SEO Score API
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-27: SEO Score API', () => {
  test('API seo-score mengembalikan seoScore dan checklist untuk pillar article', async ({
    request,
  }) => {
    await ensurePillarArticle(request);

    const res = await request.get(
      `${API_URL}/api/v1/admin/articles/seo-score?articleId=${createdPillarArticleId}`,
      {
        headers: { Authorization: `Bearer ${adminAuth.token}` },
      },
    );
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: {
        seoScore: number;
        isPillarContent: boolean;
        pillarConnectionStatus: string;
        checklist: Record<string, { status: unknown; message: string; impact: string }>;
      };
    };

    expect(body.data.seoScore).toBeDefined();
    expect(typeof body.data.seoScore).toBe('number');
    // Pillar content should score 100
    expect(body.data.isPillarContent).toBe(true);
    expect(body.data.seoScore).toBe(100);

    // Checklist should have 3 items
    expect(body.data.checklist).toBeDefined();
    const checkKeys = Object.keys(body.data.checklist);
    expect(checkKeys).toContain('pillarLinkFound');
    expect(checkKeys).toContain('anchorTextOptimization');
    expect(checkKeys).toContain('linkDilutionCheck');
  });

  test('API seo-score untuk cluster article dengan link ke pillar', async ({ request }) => {
    await ensureClusterArticle(request);

    const res = await request.get(
      `${API_URL}/api/v1/admin/articles/seo-score?articleId=${createdClusterArticleId}`,
      {
        headers: { Authorization: `Bearer ${adminAuth.token}` },
      },
    );
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: {
        seoScore: number;
        isPillarContent: boolean;
        pillarConnectionStatus: string;
        checklist: { pillarLinkFound: { status: boolean | string } };
      };
    };

    expect(body.data.isPillarContent).toBe(false);
    // Cluster article has a link to pillar → pillarLinkFound should be true
    expect(body.data.checklist.pillarLinkFound.status).toBe(true);
    expect(body.data.seoScore).toBeGreaterThanOrEqual(50);
  });

  test('API seo-score membutuhkan articleId', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/admin/articles/seo-score`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    expect(res.status()).toBe(400);
  });

  test('API seo-score memerlukan auth', async ({ request }) => {
    await ensurePillarArticle(request);

    const res = await request.get(
      `${API_URL}/api/v1/admin/articles/seo-score?articleId=${createdPillarArticleId}`,
    );
    expect(res.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEOE2E-28: Cluster Visualizer Dashboard
// ═══════════════════════════════════════════════════════════════════

test.describe('SEOE2E-28: Cluster Visualizer Dashboard', () => {
  test('Halaman pillar-clusters dapat diakses oleh admin', async ({ page }) => {
    await page.goto('/dashboard/admin/pillar-clusters');
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Cluster Visualizer', { timeout: 15000 });
  });

  test('Halaman menampilkan stat cards: Total, Pillar, Cluster, Orphan', async ({ page }) => {
    await page.goto('/dashboard/admin/pillar-clusters');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await expect(page.locator('h1')).toContainText('Cluster Visualizer', { timeout: 15000 });

    // Stat cards should be present
    await expect(page.locator('text=Total Artikel').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Content Pillar').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Cluster Articles').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Orphan Articles').first()).toBeVisible({ timeout: 5000 });
  });

  test('Halaman menampilkan progress bar konektivitas', async ({ page }) => {
    await page.goto('/dashboard/admin/pillar-clusters');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await expect(page.locator('h1')).toContainText('Cluster Visualizer', { timeout: 15000 });

    // Connection status section
    await expect(page.locator('text=Konektivitas Cluster').first()).toBeVisible({ timeout: 10000 });

    // Progress bar should be present
    const progressBar = page.locator('.overflow-hidden.rounded-full').first();
    await expect(progressBar).toBeVisible({ timeout: 5000 });
  });

  test('Halaman menampilkan tabel artikel pilar', async ({ page }) => {
    await page.goto('/dashboard/admin/pillar-clusters');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await expect(page.locator('h1')).toContainText('Cluster Visualizer', { timeout: 15000 });

    // Pillar table section
    await expect(page.locator('text=Artikel Pilar').first()).toBeVisible({ timeout: 10000 });
  });

  test('Refresh button ada dan berfungsi', async ({ page }) => {
    await page.goto('/dashboard/admin/pillar-clusters');
    await page.waitForLoadState('networkidle');

    // Refresh button should exist
    const refreshBtn = page.locator('button', { hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible({ timeout: 15000 });

    // Click refresh should not break the page
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Cluster Visualizer', { timeout: 15000 });
  });
});
