import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

// ── Shared resources ───────────────────────────────────────────
let articleId: string | undefined;
let pageId: string | undefined;

test.beforeAll(async ({ request }) => {
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  // Create a test article
  const slug = `lock-list-e2e-article-${Date.now()}`;
  const articleRes = await request.post('http://localhost:3000/api/v1/admin/articles', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      title: 'Lock List E2E Test Article',
      slug,
      content: '<p>Test article for lock list E2E.</p>',
      status: 'Draft',
    },
  });
  expect(articleRes.ok()).toBeTruthy();
  const articleBody = (await articleRes.json()) as { data?: { id: string } };
  articleId = articleBody.data?.id;

  // Get an existing CMS page for lock testing
  const pagesRes = await request.get('http://localhost:3000/api/v1/admin/cms-pages', {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  if (pagesRes.ok()) {
    const pagesBody = (await pagesRes.json()) as { data?: Array<{ id: string }> };
    const pages = pagesBody.data ?? [];
    if (pages.length > 0) {
      pageId = pages[0].id;
    }
  }
});

test.afterAll(async ({ request }) => {
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  if (articleId) {
    // Release any lock on the article
    await request
      .post('http://localhost:3000/api/v1/admin/locks/release', {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { resourceType: 'article', resourceId: articleId },
      })
      .catch(() => {});
    // Delete test article
    await request
      .delete(`http://localhost:3000/api/v1/admin/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .catch(() => {});
  }

  if (pageId) {
    await request
      .post('http://localhost:3000/api/v1/admin/locks/release', {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { resourceType: 'cms_page', resourceId: pageId },
      })
      .catch(() => {});
  }
});

// ══════════════════════════════════════════════════════════════
//  Article list lock indicator
// ══════════════════════════════════════════════════════════════

test('Article list shows lock indicator when article is being edited', async ({
  browser,
  request,
}) => {
  test.skip(!articleId, 'Failed to create test article');

  const adminAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );
  const admin2Auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin2.email,
    TEST_CREDENTIALS.admin2.password,
  );

  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();

  try {
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await setAuthCookie(page1, adminAuth);
    await setAuthCookie(page2, admin2Auth);

    // ── Admin1 opens article editor → acquires lock ──
    await page1.goto(`/dashboard/admin/articles/edit/${articleId}`);
    await page1.waitForLoadState('networkidle');
    await expect(page1.locator('.ProseMirror')).toBeVisible({ timeout: 30000 });

    // ── Admin2 opens article list → sees lock indicator ──
    await page2.goto('/dashboard/admin/articles');
    await page2.waitForLoadState('networkidle');

    // Wait for the table to render
    await expect(page2.locator('table')).toBeVisible({ timeout: 15000 });

    // Wait for lock polling to populate (up to 35s: initial fetch + 30s poll)
    // The LockBadge should show in the table
    const lockBadge = page2.locator('table [data-testid="lock-badge"]');
    await expect(lockBadge.first()).toBeVisible({ timeout: 35000 });
    // Verify the email is shown inside the badge
    await expect(lockBadge).toContainText(TEST_CREDENTIALS.admin.email, { timeout: 5000 });

    // The Edit button for this article should show "Dikunci" and be disabled
    const editBtn = page2
      .locator(`table tr:has-text("Lock List E2E Test Article")`)
      .locator('button:has-text("Dikunci")');
    await expect(editBtn).toBeDisabled({ timeout: 5000 });
    await expect(editBtn).toHaveAttribute('title', /Diedit oleh/, { timeout: 5000 });
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});

// ══════════════════════════════════════════════════════════════
//  CMS Pages list lock indicator
// ══════════════════════════════════════════════════════════════

test('CMS pages list shows lock indicator when page is being edited', async ({
  browser,
  request,
}) => {
  test.skip(!pageId, 'No CMS page available in seed data');

  const adminAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );
  const admin2Auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin2.email,
    TEST_CREDENTIALS.admin2.password,
  );

  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();

  try {
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await setAuthCookie(page1, adminAuth);
    await setAuthCookie(page2, admin2Auth);

    // ── Admin1 opens page editor → acquires lock ──
    await page1.goto(`/dashboard/admin/cms-pages/edit/${pageId}`);
    await page1.waitForLoadState('networkidle');
    // Wait for React editor to hydrate (look for the title input rendered by React)
    await expect(page1.locator('input[name="title"], textarea[name="title"]')).toBeVisible({
      timeout: 30000,
    });
    // Give React useEffect (useContentLock) time to acquire the lock
    await page1.waitForTimeout(500);

    // ── Admin2 opens CMS pages list → sees lock indicator ──
    await page2.goto('/dashboard/admin/cms-pages');
    await page2.waitForLoadState('networkidle');

    await expect(page2.locator('table')).toBeVisible({ timeout: 15000 });

    // Wait for lock polling to populate
    const lockBadge = page2.locator('table [data-testid="lock-badge"]');
    await expect(lockBadge.first()).toBeVisible({ timeout: 35000 });
    await expect(lockBadge).toContainText(TEST_CREDENTIALS.admin.email, { timeout: 5000 });

    // Edit button shows "Dikunci" and is disabled
    const editBtn = page2.locator(`table button:has-text("Dikunci")`);
    await expect(editBtn.first()).toBeDisabled({ timeout: 5000 });
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});

// ══════════════════════════════════════════════════════════════
//  FAQ list lock indicator (via modal)
// ══════════════════════════════════════════════════════════════

let faqId: string | undefined;

test.beforeEach(async ({ request }) => {
  if (faqId) return; // already created

  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  const res = await request.post('http://localhost:3000/api/v1/admin/faq', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      question: `Lock List E2E FAQ ${Date.now()}`,
      answer: '<p>Test FAQ for lock list E2E.</p>',
      category: null,
      displayOrder: 0,
      isActive: 'true',
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { data?: { id: string } };
  faqId = body.data?.id;
});

test.afterEach(async ({ request }) => {
  if (!faqId) return;

  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  // Release lock + delete
  await request
    .post('http://localhost:3000/api/v1/admin/locks/release', {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { resourceType: 'faq', resourceId: faqId },
    })
    .catch(() => {});
  await request
    .delete(`http://localhost:3000/api/v1/admin/faq/${faqId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    .catch(() => {});
  faqId = undefined;
});

test('FAQ list shows lock indicator when FAQ is being edited', async ({ browser, request }) => {
  test.skip(!faqId, 'Failed to create test FAQ');

  const adminAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );
  const admin2Auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin2.email,
    TEST_CREDENTIALS.admin2.password,
  );

  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();

  try {
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await setAuthCookie(page1, adminAuth);
    await setAuthCookie(page2, admin2Auth);

    // ── Admin1 opens FAQ list and clicks Edit → modal opens → lock acquired ──
    await page1.goto('/dashboard/admin/faq');
    await page1.waitForLoadState('networkidle');

    // Find the FAQ in the table and click Edit
    const editBtn = page1
      .locator(`table tr`)
      .filter({ hasText: 'Lock List E2E FAQ' })
      .locator('button:has-text("Edit")');
    await expect(editBtn.first()).toBeVisible({ timeout: 15000 });
    await editBtn.first().click();

    // Wait for the FAQ modal to open
    await expect(page1.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });
    // Wait for React lazy chunk + useContentLock hook to finish acquiring the lock
    await page1.waitForTimeout(1000);

    // ── Admin2 opens FAQ list → sees lock indicator ──
    await page2.goto('/dashboard/admin/faq');
    await page2.waitForLoadState('networkidle');

    await expect(page2.locator('table')).toBeVisible({ timeout: 15000 });

    // Wait for lock polling to populate
    const lockBadge = page2.locator('table [data-testid="lock-badge"]');
    await expect(lockBadge.first()).toBeVisible({ timeout: 35000 });
    await expect(lockBadge).toContainText(TEST_CREDENTIALS.admin.email, { timeout: 5000 });

    // The Edit button for this FAQ shows "Dikunci" and is disabled
    const dikunciBtn = page2
      .locator(`table tr`)
      .filter({ hasText: 'Lock List E2E FAQ' })
      .locator('button:has-text("Dikunci")');
    await expect(dikunciBtn).toBeDisabled({ timeout: 5000 });
    await expect(dikunciBtn).toHaveAttribute('title', /Diedit oleh/, { timeout: 5000 });
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});
