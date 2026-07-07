import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

test.describe('Permission Tests - E2E-026', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });
  test('Guest cannot access any dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Customer cannot access partner dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner');
    await expect(page).toHaveURL(/\/403/);
  });

  test('Customer cannot access corporate dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/corporate');
    await expect(page).toHaveURL(/\/403/);
  });

  test('Partner cannot access admin dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/403/);
  });

  test('Partner cannot access customer dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/customer');
    await expect(page).toHaveURL(/\/403/);
  });

  test('Dispatcher can access admin dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.dispatcher.email,
      TEST_CREDENTIALS.dispatcher.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });

  test('Finance can access admin dashboard', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.finance.email,
      TEST_CREDENTIALS.finance.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });
});
