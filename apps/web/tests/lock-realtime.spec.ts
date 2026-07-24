import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

// ══════════════════════════════════════════════════════════════
//  Real-time Lock Update E2E Tests
// ══════════════════════════════════════════════════════════════
//
//  Tests ini memverifikasi bahwa lock indicator pada daftar artikel
//  muncul/hilang secara real-time via SSE (Redis Pub/Sub), bukan
//  menunggu polling 30s.
//
//  **Requirement:** Redis harus berjalan di server (profile 'cache'
//  di docker-compose.dev, atau selalu aktif di production).
//  Jika Redis tidak tersedia, SSE tidak dapat push event dan test
//  akan fallback ke timeout (lock hanya muncul via polling 30s).
// ══════════════════════════════════════════════════════════════

test.describe.configure({ mode: 'serial' });

// ── Shared resources ───────────────────────────────────────────
let articleId: string | undefined;

test.beforeAll(async ({ request }) => {
  // Create a test article
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  const slug = `lock-realtime-e2e-${Date.now()}`;
  const res = await request.post('http://localhost:3000/api/v1/admin/articles', {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      title: 'Lock Realtime E2E Test Article',
      slug,
      content: '<p>Test article for real-time lock updates.</p>',
      status: 'Draft',
    },
  });

  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { data?: { id: string } };
  articleId = body.data?.id;
});

test.afterAll(async ({ request }) => {
  const auth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );

  if (articleId) {
    // Release any remaining lock
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
});

// ══════════════════════════════════════════════════════════════
//  Real-time lock indicator update via SSE
// ══════════════════════════════════════════════════════════════

test('lock indicator appears real-time via SSE when another user acquires lock', async ({
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

    // ── Step 1: Admin2 opens article list and waits for it to render ──
    // We must have Admin2's page already open BEFORE Admin1 acquires the lock,
    // so we can measure how fast the lock indicator appears.
    await page2.goto('/dashboard/admin/articles');
    await page2.waitForLoadState('networkidle');
    await expect(page2.locator('table')).toBeVisible({ timeout: 15000 });

    // Ensure the test article row is visible (it should be in the table)
    const articleRow = page2
      .locator('table tr')
      .filter({ hasText: 'Lock Realtime E2E Test Article' });
    await expect(articleRow).toBeVisible({ timeout: 15000 });

    // Before Admin1 acquires: no lock badge for this article
    const initialLockBadge = articleRow.locator('[data-testid="lock-badge"]');
    await expect(initialLockBadge).toHaveCount(0, { timeout: 5000 });

    // ── Step 2: Admin1 acquires lock on article ──
    const lockAcquired = page1.waitForResponse(
      (res) => res.url().includes('/admin/locks/acquire'),
      { timeout: 15000 },
    );
    await page1.goto(`/dashboard/admin/articles/edit/${articleId}`);
    await page1.waitForLoadState('networkidle');

    // Make sure Admin1's editor loaded
    await expect(page1.locator('.ProseMirror')).toBeVisible({ timeout: 30000 });
    await lockAcquired;

    // ── Step 3: Verify Admin2 sees lock indicator in REAL TIME ──
    // The lock should appear via SSE within SECONDS, not waiting for 30s polling.
    // Use a short timeout (15s) to confirm real-time behavior.
    // 15s = project default expect.timeout, cukup untuk SSE path.
    // Jika Redis tidak jalan, test akan fail — lihat komentar di header.
    await expect(initialLockBadge).toBeVisible({ timeout: 15000 });
    await expect(initialLockBadge).toContainText(TEST_CREDENTIALS.admin.email, { timeout: 5000 });

    // Verify the Edit button shows "Dikunci" and is disabled
    const editBtn = articleRow.locator('button:has-text("Dikunci")');
    await expect(editBtn).toBeDisabled({ timeout: 5000 });
    await expect(editBtn).toHaveAttribute('title', /Diedit oleh/, { timeout: 5000 });

    // ── Step 4: Admin1 releases the lock ──
    // Note: we use API directly because the editor page doesn't auto-release on navigation
    await request.post('http://localhost:3000/api/v1/admin/locks/release', {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { resourceType: 'article', resourceId: articleId },
    });

    // ── Step 5: Verify Admin2 sees lock indicator disappear in REAL TIME ──
    // The lock should vanish via SSE within seconds.
    await expect(initialLockBadge).toHaveCount(0, { timeout: 15000 });

    // Edit button should become available again
    await expect(editBtn).toHaveCount(0, { timeout: 5000 });
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});

// ══════════════════════════════════════════════════════════════
//  Real-time lock takeover update via SSE
// ══════════════════════════════════════════════════════════════

test('lock indicator updates in real-time when lock is taken over', async ({
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

    // ── Step 1: Admin1 acquires lock ──
    const lockAcquired = page1.waitForResponse(
      (res) => res.url().includes('/admin/locks/acquire'),
      { timeout: 15000 },
    );
    await page1.goto(`/dashboard/admin/articles/edit/${articleId}`);
    await page1.waitForLoadState('networkidle');
    await expect(page1.locator('.ProseMirror')).toBeVisible({ timeout: 30000 });
    await lockAcquired;

    // ── Step 2: Admin2 opens article list — should see lock indicator ──
    await page2.goto('/dashboard/admin/articles');
    await page2.waitForLoadState('networkidle');
    await expect(page2.locator('table')).toBeVisible({ timeout: 15000 });

    const articleRow = page2
      .locator('table tr')
      .filter({ hasText: 'Lock Realtime E2E Test Article' });
    const lockBadge = articleRow.locator('[data-testid="lock-badge"]');

    // Wait for lock indicator (could be via SSE or polling)
    await expect(lockBadge).toBeVisible({ timeout: 35000 });
    await expect(lockBadge).toContainText(TEST_CREDENTIALS.admin.email, { timeout: 5000 });

    // ── Step 3: Admin2 takes over lock via API ──
    await request.post('http://localhost:3000/api/v1/admin/locks/takeover', {
      headers: { Authorization: `Bearer ${admin2Auth.token}` },
      data: { resourceType: 'article', resourceId: articleId },
    });

    // ── Step 4: Verify Admin2's list shows updated email in REAL TIME via SSE ──
    // The lock badge should now show admin2's email (not admin1's)
    await expect(lockBadge).toHaveText(new RegExp(TEST_CREDENTIALS.admin2.email), {
      timeout: 15000,
    });
    await expect(lockBadge).not.toHaveText(new RegExp(TEST_CREDENTIALS.admin.email), {
      timeout: 5000,
    });

    // ── Step 5: Admin2 releases the lock via API ──
    await request.post('http://localhost:3000/api/v1/admin/locks/release', {
      headers: { Authorization: `Bearer ${admin2Auth.token}` },
      data: { resourceType: 'article', resourceId: articleId },
    });

    // ── Step 6: Verify lock indicator disappears ──
    await expect(lockBadge).toHaveCount(0, { timeout: 15000 });
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});
