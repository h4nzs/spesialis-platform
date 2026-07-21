import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

test.describe('Service Detail - HowTo Schema & Related Services', () => {
  let serviceSlug: string;
  let serviceName: string;
  let categoryId: string | null;

  test.beforeAll(async ({ request }) => {
    // Get a service with a categoryId (needed for Related Services)
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=10`);
    expect(svcRes.status()).toBe(200);
    const svcBody = (await svcRes.json()) as {
      data?: Array<{ slug: string; name: string; categoryId: string | null }>;
    };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);

    // Prefer a service with a categoryId for full coverage (HowTo category + Related)
    const withCategory = svcBody.data!.find((s) => s.categoryId);
    if (withCategory) {
      serviceSlug = withCategory.slug;
      serviceName = withCategory.name;
      categoryId = withCategory.categoryId;
    } else {
      serviceSlug = svcBody.data![0]!.slug;
      serviceName = svcBody.data![0]!.name;
      categoryId = svcBody.data![0]!.categoryId;
    }
  });

  // ── HowTo Schema Tests ─────────────────────────────────────────

  test('SEOE2E-21: HowTo JSON-LD schema is present in page source', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    const response = await page.goto(`/services/${serviceSlug}`);
    expect(response?.status()).toBe(200);

    const html = await page.content();

    // HowTo schema type must exist
    expect(html).toContain('"@type":"HowTo"');
    expect(html).toContain('"@type":"HowToStep"');
    expect(html).toContain('"@type":"HowToDirection"');

    // Should have position numbers (at least position 1)
    expect(html).toContain('"position":1');

    // Service name should appear in the HowTo name
    expect(html).toContain(`Cara Memesan ${serviceName}`);
  });

  test('SEOE2E-21: HowTo schema has valid step structure with positions', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);

    const jsonLdScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map((s) => {
        try {
          return JSON.parse(s.textContent ?? '{}');
        } catch {
          return null;
        }
      });
    });

    let howToFound = false;

    for (const script of jsonLdScripts) {
      if (!script || !script['@graph']) continue;
      for (const item of script['@graph'] as Record<string, unknown>[]) {
        if (item['@type'] === 'HowTo') {
          howToFound = true;

          // Verify HowTo has name and description
          expect(item.name).toBeTruthy();
          expect(typeof item.name).toBe('string');
          expect(item.description).toBeTruthy();
          expect(typeof item.description).toBe('string');

          // Verify steps exist
          const steps = item.step as Array<Record<string, unknown>>;
          expect(steps).toBeDefined();
          expect(Array.isArray(steps)).toBe(true);
          expect(steps.length).toBeGreaterThanOrEqual(4); // Min 4 steps (generic fallback)

          // Verify each step has proper structure
          for (const step of steps) {
            expect(step['@type']).toBe('HowToStep');
            expect(typeof step.position).toBe('number');
            expect(step.position).toBeGreaterThanOrEqual(1);
            expect(step.name).toBeTruthy();
            expect(typeof step.name).toBe('string');

            // Verify itemListElement with HowToDirection
            const directions = step.itemListElement as Array<Record<string, unknown>>;
            expect(directions).toBeDefined();
            expect(Array.isArray(directions)).toBe(true);
            expect(directions.length).toBeGreaterThanOrEqual(1);

            const direction = directions[0] as Record<string, unknown>;
            expect(direction['@type']).toBe('HowToDirection');
            expect(direction.text).toBeTruthy();
            expect(typeof direction.text).toBe('string');
          }

          // Position numbers should be sequential: 1, 2, 3, ...
          for (let i = 0; i < steps.length; i++) {
            expect(steps[i]!.position).toBe(i + 1);
          }

          break;
        }
      }
      if (howToFound) break;
    }

    expect(howToFound).toBe(true);
  });

  test('SEOE2E-21: HowTo schema has totalTime when service has estimatedDuration', async ({
    page,
    request,
  }) => {
    expect(serviceSlug).toBeDefined();

    // Check if service has estimatedDuration
    const svcRes = await request.get(`${API_URL}/api/v1/services/${serviceSlug}`);
    expect(svcRes.status()).toBe(200);
    const svcBody = (await svcRes.json()) as {
      data: { estimatedDuration: number | null };
    };
    const hasDuration = svcBody.data?.estimatedDuration != null;

    await page.goto(`/services/${serviceSlug}`);

    const jsonLdScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map((s) => {
        try {
          return JSON.parse(s.textContent ?? '{}');
        } catch {
          return null;
        }
      });
    });

    for (const script of jsonLdScripts) {
      if (!script || !script['@graph']) continue;
      for (const item of script['@graph'] as Record<string, unknown>[]) {
        if (item['@type'] === 'HowTo') {
          if (hasDuration) {
            // If service has duration, HowTo should have totalTime
            expect(item.totalTime).toBeDefined();
            expect(typeof item.totalTime).toBe('string');
            // Format should be ISO 8601: PT<number>M
            expect(item.totalTime).toMatch(/^PT\d+M$/);
          }
          // If no duration, totalTime should NOT be present (handled by code)
          break;
        }
      }
    }
  });

  test('SEOE2E-21: All 4 schemas coexist in JSON-LD @graph', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);

    const jsonLdScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map((s) => {
        try {
          return JSON.parse(s.textContent ?? '{}');
        } catch {
          return null;
        }
      });
    });

    let foundBreadcrumb = false;
    let foundService = false;
    let foundFaqPage = false;
    let foundHowTo = false;

    for (const script of jsonLdScripts) {
      if (!script || !script['@graph']) continue;
      for (const item of script['@graph'] as Record<string, unknown>[]) {
        if (item['@type'] === 'BreadcrumbList') foundBreadcrumb = true;
        if (item['@type'] === 'Service') foundService = true;
        if (item['@type'] === 'FAQPage') foundFaqPage = true;
        if (item['@type'] === 'HowTo') foundHowTo = true;
      }
    }

    expect(foundBreadcrumb).toBe(true);
    expect(foundService).toBe(true);
    expect(foundFaqPage).toBe(true);
    expect(foundHowTo).toBe(true);
  });

  // ── Related Services Tests ─────────────────────────────────────

  test('SEOE2E-22: Related Services section renders with heading', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Check if Related Services section exists
    const relatedHeading = page.locator('h2:has-text("Layanan Terkait")');
    const relatedCount = await relatedHeading.count();

    // If service has a categoryId, Related Services section should exist
    if (categoryId) {
      await expect(relatedHeading).toBeVisible({ timeout: 10000 });
    }
    // If no categoryId, section may not appear — test gracefully skips
  });

  test('SEOE2E-22: Related Services renders cards with links', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Only test if the section exists (service has categoryId)
    if (categoryId) {
      const relatedHeading = page.locator('h2:has-text("Layanan Terkait")');
      await expect(relatedHeading).toBeVisible({ timeout: 10000 });

      // Cards are <a> tags within the related services section
      const cards = page.locator('h2:text("Layanan Terkait") ~ div a[href^="/services/"]');
      const cardCount = await cards.count();

      // Should have at least 1 card (and not include the current service)
      expect(cardCount).toBeGreaterThanOrEqual(1);

      // Each card should have a valid href
      for (let i = 0; i < cardCount; i++) {
        const href = await cards.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^\/services\//);

        // Card href should NOT be the current service's slug
        expect(href).not.toBe(`/services/${serviceSlug}`);
      }
    }
  });

  test('SEOE2E-22: Related Services cards show service name and price', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    if (categoryId) {
      const relatedHeading = page.locator('h2:has-text("Layanan Terkait")');
      await expect(relatedHeading).toBeVisible({ timeout: 10000 });

      // Each card should have a heading (h3) and a price
      const cards = page.locator('h2:text("Layanan Terkait") ~ div a[href^="/services/"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);

      // Each card should contain a heading (service name) and price
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = cards.nth(i);
        const cardText = await card.textContent();
        expect(cardText).toBeTruthy();

        // Card should contain pricing info (Rp format)
        expect(cardText).toMatch(/[Rr][Pp]|[Rr]p\./);
      }
    }
  });

  test('SEOE2E-22: Current service is NOT in Related Services', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    if (categoryId) {
      const relatedHeading = page.locator('h2:has-text("Layanan Terkait")');
      // Only test if section exists
      if ((await relatedHeading.count()) > 0) {
        // Verify the current service is NOT in the related section
        const mainHref = `/services/${serviceSlug}`;
        const selfLink = page.locator(`h2:text("Layanan Terkait") ~ div a[href="${mainHref}"]`);
        await expect(selfLink).toHaveCount(0);
      }
    }
  });
});
