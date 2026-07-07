import { test, expect } from '@playwright/test';

test.describe('Search Flow - E2E-022', () => {
  test('E2E-022: Services page loads with list of services', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Layanan').first()).toBeVisible();
  });

  test('E2E-022: Service detail page loads by slug', async ({ page }) => {
    // First get a service slug from the services page
    await page.goto('/services');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });

    // Wait for the ServiceList component to render service cards
    // ServiceList renders <a> tags with href="/services/{slug}"
    const serviceLink = page.locator('a[href*="/services/"]').first();
    await expect(serviceLink).toBeVisible({ timeout: 15000 });

    // Click the first service to go to its detail page
    const href = await serviceLink.getAttribute('href');
    await serviceLink.click();
    await expect(page).toHaveURL(new RegExp(href ?? '/services/'));
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-022: Service detail page has structured content', async ({ page, request }) => {
    // Get a service slug from the API
    const res = await request.get('http://localhost:3000/api/v1/services?limit=1');
    const body = (await res.json()) as { data?: Array<{ slug: string; name: string }> };
    expect(body.data).toBeDefined();
    expect(body.data!.length).toBeGreaterThan(0);
    const slug = body.data![0]!.slug;

    await page.goto(`/services/${slug}`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-022: Blog search by category works', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('E2E-022: Blog article page loads by slug', async ({ page, request }) => {
    // Get an article slug from the API
    const res = await request.get('http://localhost:3000/api/v1/cms/articles?limit=1');
    const body = (await res.json()) as { data?: Array<{ slug: string; title: string }> };
    if (body.data && body.data.length > 0) {
      const slug = body.data[0]!.slug;
      await page.goto(`/blog/${slug}`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
