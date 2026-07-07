import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Admin Content Management - E2E-021 / E2E-019', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;
  let createdArticleId: string;
  let createdArticleSlug: string;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
  });

  test('E2E-019: Admin can manage articles', async ({ page }) => {
    await page.goto('/dashboard/admin/articles');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-019: Create article as draft via API', async ({ request }) => {
    const uniqueSlug = `e2e-test-article-${Date.now()}`;
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        title: 'E2E Test Article - Draft',
        slug: uniqueSlug,
        content: 'This is a test article created by E2E test for publishing flow verification.',
        summary: 'E2E test article summary',
        authorName: 'E2E Test Bot',
        status: 'Draft',
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      data: { id: string; title: string; slug: string; status: string };
    };
    expect(body.data).toBeDefined();
    expect(body.data.slug).toBe(uniqueSlug);
    expect(body.data.status).toBe('Draft');
    createdArticleId = body.data.id;
    createdArticleSlug = body.data.slug;
  });

  test('E2E-019: Publish article by changing status to Published', async ({ request }) => {
    expect(createdArticleId).toBeDefined();
    const res = await request.patch(`${API_URL}/api/v1/admin/articles/${createdArticleId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { status: 'Published' },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string; publishedAt: string | null } };
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('Published');
    expect(body.data.publishedAt).toBeTruthy();
  });

  test('E2E-019: Published article appears in public blog API', async ({ request }) => {
    expect(createdArticleSlug).toBeDefined();
    // Public API only returns published articles (filtered server-side)
    const res = await request.get(`${API_URL}/api/v1/articles?limit=20`);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data?: Array<{ slug: string }> };
    expect(body.data).toBeDefined();
    const found = body.data!.find((a) => a.slug === createdArticleSlug);
    expect(found).toBeDefined();
    // Verify via admin API which includes status field
    const adminRes = await request.get(`${API_URL}/api/v1/admin/articles?limit=20`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(adminRes.status()).toBe(200);
    const adminBody = (await adminRes.json()) as { data?: Array<{ slug: string; status: string }> };
    const adminFound = adminBody.data!.find((a) => a.slug === createdArticleSlug);
    expect(adminFound).toBeDefined();
    expect(adminFound!.status).toBe('Published');
  });

  test('E2E-019: Duplicate article slug returns 409', async ({ request }) => {
    expect(createdArticleSlug).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        title: 'Duplicate Article',
        slug: createdArticleSlug,
        content: 'This is a duplicate slug test.',
        status: 'Draft',
      },
    });
    expect(res.status()).toBe(409);
  });

  test('E2E-019: Article with invalid data returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { title: '', slug: '', status: 'InvalidStatus' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-019: Unauthenticated article create returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/admin/articles`, {
      data: {
        title: 'No Auth Test',
        slug: 'no-auth-test',
        content: 'Test',
        status: 'Draft',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('E2E-021: Admin services page for media/service management', async ({ page }) => {
    await page.goto('/dashboard/admin/services');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-021: Admin services page loads with service list', async ({ page }) => {
    await page.goto('/dashboard/admin/services');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('E2E-021: File upload via API works correctly', async ({ request }) => {
    // Create a small test image buffer (1x1 pixel PNG)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    const res = await request.post(`${API_URL}/api/v1/media/upload`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      multipart: {
        file: {
          name: 'e2e-test-image.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        },
      },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      data: { id: string; filename: string; url: string; mimeType: string };
    };
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.filename).toBe('e2e-test-image.png');
    expect(body.data.mimeType).toBe('image/png');
    expect(body.data.url).toContain('/api/v1/media/');

    // Verify uploaded file metadata can be retrieved
    const getRes = await request.get(`${API_URL}${body.data.url.replace('/file', '')}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(getRes.status()).toBe(200);
    const getBody = (await getRes.json()) as { data: { id: string; filename: string } };
    expect(getBody.data.filename).toBe('e2e-test-image.png');
  });

  test('E2E-021: Media upload rejects non-images', async ({ request }) => {
    const textBuffer = Buffer.from('not an image file content');
    const res = await request.post(`${API_URL}/api/v1/media/upload`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: textBuffer,
        },
      },
    });
    // Should reject invalid file type
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('INVALID_FILE_TYPE');
  });

  test('Admin settings page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin FAQ management page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/faq');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
