import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

test.describe('Partner Flows - E2E-007 / E2E-009', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
  });

  test('E2E-007: Partner dashboard loads with job assignments', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-009: Partner can view their jobs', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner/jobs');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Partner can view their earnings', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner/earnings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Partner can manage availability', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner/availability');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Corporate Flows - E2E-010 / E2E-011', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.corporate.email,
      TEST_CREDENTIALS.corporate.password,
    );
  });

  test('E2E-010: Corporate login and dashboard access', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/corporate');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-011: Corporate can view orders/invoices', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/corporate/orders');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Corporate can view invoices', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/corporate/invoices');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Corporate can manage branches', async ({ page }) => {
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/corporate/branches');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
