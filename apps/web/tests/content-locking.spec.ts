import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

let articleId: string | undefined;

test.beforeAll(async ({ request }) => {
  // Create an article via API to use for testing locks
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  const slug = `content-lock-e2e-${Date.now()}`;
  const res = await request.post('http://localhost:3000/api/v1/admin/articles', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      title: 'Content Lock E2E Test Article',
      slug,
      content: '<p>This is a test article for content locking E2E.</p>',
      status: 'Draft',
    },
  });

  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { data?: { id: string } };
  articleId = body.data?.id;
});

test.afterAll(async ({ request }) => {
  // Release any remaining lock and delete the test article
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  if (articleId) {
    // Best-effort: release lock (might not exist, ignore error)
    await request
      .post('http://localhost:3000/api/v1/admin/locks/release', {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { resourceType: 'article', resourceId: articleId },
      })
      .catch(() => {});

    // Delete the test article
    await request
      .delete(`http://localhost:3000/api/v1/admin/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .catch(() => {});
  }
});

test('Two users editing same article — lock banner + takeover flow', async ({
  browser,
  request,
}) => {
  test.skip(!articleId, 'Failed to create test article');

  // ── Setup: two browser contexts with different users ─────────
  const admin1Auth = await loginViaApi(
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

    await setAuthCookie(page1, admin1Auth);
    await setAuthCookie(page2, admin2Auth);

    // ── Step 1: Admin1 opens article editor → acquires lock ──
    await page1.goto(`/dashboard/admin/articles/edit/${articleId}`);
    await page1.waitForLoadState('networkidle');

    // Wait for React editor to fully hydrate (lazy-loaded TipTap editor chunk)
    await expect(page1.locator('.ProseMirror')).toBeVisible({ timeout: 30000 });

    // Admin1 should NOT see any lock banner (they hold the lock)
    await expect(page1.locator('[data-testid="lock-banner"]')).toHaveCount(0, { timeout: 5000 });
    // Submit button is enabled (not locked)
    await expect(page1.locator('button[type="submit"]')).toBeEnabled({ timeout: 5000 });

    // ── Step 2: Admin2 opens same article → sees lock banner ──
    await page2.goto(`/dashboard/admin/articles/edit/${articleId}`);
    await page2.waitForLoadState('networkidle');

    // Wait for React editor to fully hydrate
    await expect(page2.locator('.ProseMirror')).toBeVisible({ timeout: 30000 });

    // Admin2 sees the lock banner with admin's email
    await expect(page2.locator('[data-testid="lock-banner"]')).toBeVisible({ timeout: 10000 });
    await expect(
      page2.locator(`[data-testid="lock-banner"]`).locator(`text=${TEST_CREDENTIALS.admin.email}`),
    ).toBeVisible({ timeout: 5000 });

    // "Ambil Alih" button is visible
    const takeoverBtn = page2.locator('button:has-text("Ambil Alih")');
    await expect(takeoverBtn).toBeVisible({ timeout: 5000 });

    // Submit button shows "Tidak Dapat Menyimpan" and is disabled
    const submitBtn = page2.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
    await expect(submitBtn).toContainText('Tidak Dapat Menyimpan', { timeout: 5000 });

    // ── Step 3: Admin2 takes over the lock ──
    await takeoverBtn.click();

    // After takeover: lock banner should disappear
    await expect(page2.locator('[data-testid="lock-banner"]')).toHaveCount(0, { timeout: 10000 });

    // Submit button becomes enabled and shows save/publish text
    await expect(page2.locator('button[type="submit"]')).toBeEnabled({ timeout: 5000 });
    await expect(submitBtn).toContainText(/Simpan|Terbitkan/, { timeout: 5000 });

    // Note: Admin1's page will detect the takeover on the next heartbeat tick (30s)
    // and show "Kunci telah diambil alih oleh pengguna lain" — not verified here
    // because it requires a 30s wait or heartbeat manipulation.
  } finally {
    // Clean up browser contexts
    await ctx1.close();
    await ctx2.close();
  }
});
