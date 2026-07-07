import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Admin Operations - E2E-016 / E2E-017 / E2E-018', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerProfileId: string;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    // Get a partner profile ID for verification testing
    const partnersRes = await request.get(`${API_URL}/api/v1/partners?limit=5`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const partnersBody = (await partnersRes.json()) as {
      data?: Array<{ id: string; verificationStatus: string }>;
    };
    if (partnersBody.data && partnersBody.data.length > 0) {
      // Pick the first partner (prefer one with 'Pending' status)
      const pending = partnersBody.data.find((p) => p.verificationStatus === 'Pending');
      partnerProfileId = (pending ?? partnersBody.data[0]!).id;
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
  });

  test('E2E-014: Admin dashboard loads with overview', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-015: Admin can manage bookings', async ({ page }) => {
    await page.goto('/dashboard/admin/bookings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-016: Admin partners page loads with partner list', async ({ page }) => {
    await page.goto('/dashboard/admin/partners');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-016: Admin can view partners via API', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/partners?limit=5`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data?: Array<{ id: string; fullName: string }> };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data!.length).toBeGreaterThan(0);
  });

  test('E2E-016: Admin can approve a partner via API', async ({ request }) => {
    expect(partnerProfileId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/partners/${partnerProfileId}/verify`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { verificationStatus: 'Approved', note: 'Disetujui via E2E test' },
    });
    expect([200, 201]).toContain(res.status());
    const body = (await res.json()) as { data: { verificationStatus: string } };
    expect(body.data).toBeDefined();
    expect(body.data.verificationStatus).toBe('Approved');
  });

  test('E2E-016: Non-existent partner returns 404', async ({ request }) => {
    const res = await request.post(
      `${API_URL}/api/v1/partners/00000000-0000-0000-0000-000000000000/verify`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { verificationStatus: 'Approved' },
      },
    );
    expect(res.status()).toBe(404);
  });

  test('E2E-016: Unauthenticated partner verify returns 401', async ({ request }) => {
    expect(partnerProfileId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/partners/${partnerProfileId}/verify`, {
      data: { verificationStatus: 'Approved' },
    });
    expect(res.status()).toBe(401);
  });

  test('E2E-017: Admin/Finance can access payment verification', async ({ page }) => {
    await page.goto('/dashboard/admin/bookings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-018: Admin can access reports/invoices', async ({ page }) => {
    await page.goto('/dashboard/admin/reports');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin can view audit logs', async ({ page }) => {
    await page.goto('/dashboard/admin/audit-logs');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin can manage users', async ({ page }) => {
    await page.goto('/dashboard/admin/users');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Content Manager - E2E-019 / E2E-020', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.contentManager.email,
      TEST_CREDENTIALS.contentManager.password,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
  });

  test('E2E-019: Content manager can access articles management', async ({ page }) => {
    await page.goto('/dashboard/admin/articles');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-020: Content manager can access admin settings/services', async ({ page }) => {
    await page.goto('/dashboard/admin/services');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Finance Role - E2E-017', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.finance.email,
      TEST_CREDENTIALS.finance.password,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
  });

  test('E2E-017: Finance can access admin dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
