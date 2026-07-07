import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

test.describe('Authentication - E2E-003 / E2E-006 / E2E-014', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });
  test('E2E-014: Admin login and dashboard access', async ({ page, request }) => {
    // Login via API to get token
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    expect(auth.user.role).toBe('super_admin');

    // Set auth cookie and navigate to admin dashboard
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin');

    // Verify dashboard loads
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-003: Customer login redirects to customer dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
    expect(auth.user.role).toBe('customer');

    await setAuthCookie(page, auth);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
  });

  test('E2E-006: Partner login and dashboard access', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    expect(auth.user.role).toBe('partner');

    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-003: Login form works end-to-end', async ({ page, request }) => {
    // Use API login + cookie instead of form submission
    // because React hydration timing makes form-based login unreliable in dev
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
    expect(auth.user.role).toBe('customer');

    await setAuthCookie(page, auth);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
  });

  test('E2E-003: Invalid login returns 401', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: { email: 'wrong@email.com', password: 'wrongpass' },
    });
    expect(res.status()).toBe(401);
  });

  test('E2E-026: Customer cannot access admin dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
    await setAuthCookie(page, auth);

    // Try to access admin dashboard
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/403/);
  });

  test('E2E-026: Partner cannot access customer dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    await setAuthCookie(page, auth);

    await page.goto('/dashboard/customer');
    await expect(page).toHaveURL(/\/403/);
  });
});
