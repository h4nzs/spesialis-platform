import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

test.describe('Admin Flows - E2E-014 / E2E-015', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
  });

  test('E2E-014: Admin can view bookings list', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/bookings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-014: Admin can view partners list', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/partners');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-014: Admin can view customers list', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/customers');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-014: Admin can view services', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/services');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
