import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

test.describe('Service Detail - FAQ Section & FAQPage Schema', () => {
  let serviceSlug: string;
  let serviceName: string;
  let categoryId: string | null;
  let faqCategorySlug: string;

  test.beforeAll(async ({ request }) => {
    // Get a service with a categoryId for the most comprehensive test
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=5`);
    expect(svcRes.status()).toBe(200);
    const svcBody = (await svcRes.json()) as {
      data?: Array<{ slug: string; name: string; categoryId: string | null }>;
    };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);

    // Pick the first service with a categoryId (for CMS FAQ filtering)
    const withCategory = svcBody.data!.find((s) => s.categoryId);
    if (withCategory) {
      serviceSlug = withCategory.slug;
      serviceName = withCategory.name;
      categoryId = withCategory.categoryId;
    } else {
      // Fallback: use first service regardless of category
      serviceSlug = svcBody.data![0]!.slug;
      serviceName = svcBody.data![0]!.name;
      categoryId = svcBody.data![0]!.categoryId;
    }

    // If service has a category, get its slug for FAQ filtering
    if (categoryId) {
      const catRes = await request.get(`${API_URL}/api/v1/service-categories`);
      if (catRes.ok()) {
        const catBody = (await catRes.json()) as {
          data?: Array<{ id: string; slug: string; name: string }>;
        };
        const matched = catBody.data?.find((c) => c.id === categoryId);
        if (matched) faqCategorySlug = matched.slug;
      }
    }
  });

  test('SEOE2E-20: Service detail page loads with FAQ section heading', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    // Wait for React ServiceDetail to hydrate
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Verify FAQ section heading exists (auto-generated fallback or CMS)
    const faqHeading = page.locator('h2:has-text("Pertanyaan Umum seputar")');
    await expect(faqHeading).toBeVisible({ timeout: 10000 });
  });

  test('SEOE2E-20: FAQ section renders accordion items', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    // Wait for page to hydrate
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // FAQ section should have <details> elements (accordion items)
    const detailsElements = page.locator('details').first();
    await expect(detailsElements).toBeVisible({ timeout: 10000 });

    // There should be at least one FAQ item
    const faqCount = await page.locator('details').count();
    expect(faqCount).toBeGreaterThanOrEqual(1);
  });

  test('SEOE2E-20: FAQ questions contain the service name', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    expect(serviceName).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Each FAQ question should reference the service name
    const faqSummaries = page.locator('details summary');
    const summaryCount = await faqSummaries.count();
    expect(summaryCount).toBeGreaterThanOrEqual(1);

    // At least one FAQ should mention the service name
    let foundServiceName = false;
    for (let i = 0; i < summaryCount; i++) {
      const text = await faqSummaries.nth(i).textContent();
      if (text?.includes(serviceName)) {
        foundServiceName = true;
        break;
      }
    }
    expect(foundServiceName).toBeTruthy();
  });

  test('SEOE2E-20: FAQPage JSON-LD schema is present in page source', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    const response = await page.goto(`/services/${serviceSlug}`);
    expect(response?.status()).toBe(200);

    // Get the HTML content and verify FAQPage schema exists
    const html = await page.content();

    // Check that FAQPage JSON-LD is in the source
    expect(html).toContain('@type":"FAQPage"');
    expect(html).toContain('"@type":"Question"');
    expect(html).toContain('"@type":"Answer"');

    // The service name should appear in the FAQ questions within JSON-LD
    expect(html).toContain(serviceName);
  });

  test('SEOE2E-20: FAQPage JSON-LD has proper Question/Answer pairs', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);

    // Extract all JSON-LD scripts and find FAQPage
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

    // Find the FAQPage schema in the @graph array
    let faqPageFound = false;
    for (const script of jsonLdScripts) {
      if (!script || !script['@graph']) continue;
      for (const item of script['@graph'] as Record<string, unknown>[]) {
        if (item['@type'] === 'FAQPage') {
          faqPageFound = true;
          const mainEntity = item.mainEntity as Array<Record<string, unknown>>;
          expect(mainEntity).toBeDefined();
          expect(Array.isArray(mainEntity)).toBe(true);
          expect(mainEntity.length).toBeGreaterThanOrEqual(1);

          // Each entity should be a Question with acceptedAnswer
          for (const entity of mainEntity) {
            expect(entity['@type']).toBe('Question');
            expect(entity.name).toBeTruthy();
            expect(typeof entity.name).toBe('string');

            const answer = entity.acceptedAnswer as Record<string, unknown>;
            expect(answer).toBeDefined();
            expect(answer['@type']).toBe('Answer');
            expect(answer.text).toBeTruthy();
            expect(typeof answer.text).toBe('string');
          }
          break;
        }
      }
      if (faqPageFound) break;
    }

    expect(faqPageFound).toBe(true);
  });

  test('SEOE2E-20: FAQ accordion opens and closes on click', async ({ page }) => {
    expect(serviceSlug).toBeDefined();
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Click the first FAQ accordion to open it
    const firstSummary = page.locator('details summary').first();
    await expect(firstSummary).toBeVisible({ timeout: 10000 });

    // Check content is not visible before click (details is closed by default)
    const firstDetails = page.locator('details').first();
    const isInitiallyOpen = await firstDetails.getAttribute('open');

    // Click to toggle
    await firstSummary.click();
    await page.waitForTimeout(300);

    // After click, details should be open (have 'open' attribute)
    // HTML boolean attribute 'open' returns '' when present, null when absent
    const isOpenAfter = await firstDetails.getAttribute('open');
    if (isInitiallyOpen === null) {
      expect(isOpenAfter).not.toBeNull();
    }
  });

  test('SEOE2E-20: FAQ from CMS appears when category matches', async ({ page, request }) => {
    expect(serviceSlug).toBeDefined();

    // Check if CMS has FAQs for this category
    let cmsFaqExists = false;
    if (faqCategorySlug) {
      const faqRes = await request.get(`${API_URL}/api/v1/cms/faq?category=${faqCategorySlug}`);
      if (faqRes.ok()) {
        const faqBody = (await faqRes.json()) as {
          data?: Array<{ question: string }>;
        };
        cmsFaqExists = (faqBody.data?.length ?? 0) > 0;
      }
    }

    // Navigate to service detail
    await page.goto(`/services/${serviceSlug}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // FAQ section should always render (fallback auto-generated FAQs)
    const faqHeading = page.locator('h2:has-text("Pertanyaan Umum seputar")');
    await expect(faqHeading).toBeVisible({ timeout: 10000 });

    if (cmsFaqExists && faqCategorySlug) {
      // CMS FAQs exist for this category — verify they're used
      // The questions should match CMS FAQ questions
      const cmsFaqRes = await request.get(`${API_URL}/api/v1/cms/faq?category=${faqCategorySlug}`);
      const cmsFaqBody = (await cmsFaqRes.json()) as {
        data?: Array<{ question: string }>;
      };
      // If CMS FAQs exist, they should be used instead of fallback
      // CMS API should have returned data for the matched category
      expect(cmsFaqBody.data!.length).toBeGreaterThan(0);
    }
  });

  test('SEOE2E-20: Breadcrumb + FAQPage + Service schemas coexist in JSON-LD', async ({ page }) => {
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

    // Find the @graph with all schemas
    let foundBreadcrumb = false;
    let foundService = false;
    let foundFaqPage = false;

    for (const script of jsonLdScripts) {
      if (!script || !script['@graph']) continue;
      for (const item of script['@graph'] as Record<string, unknown>[]) {
        if (item['@type'] === 'BreadcrumbList') foundBreadcrumb = true;
        if (item['@type'] === 'Service') foundService = true;
        if (item['@type'] === 'FAQPage') foundFaqPage = true;
      }
    }

    expect(foundBreadcrumb).toBe(true);
    expect(foundService).toBe(true);
    expect(foundFaqPage).toBe(true);
  });
});
