import { test, expect } from '@playwright/test';

test.describe('Production Smoke Test - E2E-030', () => {
  const PUBLIC_PAGES = [
    { path: '/', label: 'Homepage' },
    { path: '/services', label: 'Services' },
    { path: '/blog', label: 'Blog' },
    { path: '/faq', label: 'FAQ' },
    { path: '/tentang-kami', label: 'About' },
    { path: '/kontak', label: 'Contact' },
    { path: '/tracking', label: 'Tracking' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
  ];

  for (const page of PUBLIC_PAGES) {
    test(`${page.label} (${page.path}) loads successfully`, async ({ page: p }) => {
      const response = await p.goto(page.path);
      expect(response?.status()).toBe(200);
      await expect(p.locator('body')).toBeVisible({ timeout: 10000 });
    });
  }

  test('404 returns non-500 status', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBeLessThan(500);
  });
});
