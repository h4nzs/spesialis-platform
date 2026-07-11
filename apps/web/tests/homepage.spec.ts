import { test, expect } from '@playwright/test';

test.describe('Public Pages - SMOKE', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ahli Panggilan/);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Services page shows service list', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/tentang-kami');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto('/kontak');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Pages', () => {
  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    // Should either show 404 page or redirect
    const is404 = await page
      .locator('text=404')
      .isVisible()
      .catch(() => false);
    const isCustom404 = page.url().includes('/404');
    expect(is404 || isCustom404).toBeTruthy();
  });

  test('401 page for unauthenticated dashboard access', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
