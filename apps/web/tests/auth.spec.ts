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

  test('E2E-003: Login form works end-to-end', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', TEST_CREDENTIALS.customer1.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.customer1.password);
    await page.click('button[type="submit"]');

    // Should redirect to customer dashboard
    await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 15000 });
  });

  test('E2E-003: Invalid login shows error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Email atau password salah')).toBeVisible({ timeout: 10000 });
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
