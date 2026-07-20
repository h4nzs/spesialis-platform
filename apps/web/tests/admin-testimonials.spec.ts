import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Admin Testimonials CRUD', () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request }) => {
    if (createdIds.length === 0) return;
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    for (const id of createdIds) {
      await request
        .delete(`${API_URL}/api/v1/admin/testimonials/${id}`, {
          headers: { Cookie: `token=${auth.token}` },
        })
        .catch(() => {});
    }
    createdIds.length = 0;
  });

  test('Admin testimonial page loads', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/testimonials');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Admin can create a testimonial via API', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    const res = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: 'E2E Test User',
        location: 'Jakarta',
        role: 'Teknisi AC',
        quote: 'Testimonial created via E2E test. Sangat puas dengan layanannya!',
        rating: 5,
        displayOrder: 99,
        isActive: 'true',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { data: { id: string; name: string } };
    expect(body.data.name).toBe('E2E Test User');
    createdIds.push(body.data.id);
  });

  test('Admin can view testimonials list', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    // First create a testimonial so list is non-empty
    const createRes = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: 'List E2E User',
        location: 'Bandung',
        quote: 'Test for list view.',
        rating: 4,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = (await createRes.json()) as { data: { id: string } };
    createdIds.push(createBody.data.id);

    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/testimonials');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('List E2E User')).toBeVisible({ timeout: 5000 });
  });

  test('Admin can edit a testimonial via API', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    // Create
    const createRes = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: 'Before Edit',
        location: 'Jakarta',
        quote: 'Original quote before edit.',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = (await createRes.json()) as { data: { id: string } };
    createdIds.push(createBody.data.id);

    // Edit
    const editRes = await request.patch(
      `${API_URL}/api/v1/admin/testimonials/${createBody.data.id}`,
      {
        headers: { Cookie: `token=${auth.token}` },
        data: {
          name: 'After Edit',
          quote: 'Updated quote after edit!',
          rating: 5,
        },
      },
    );
    expect(editRes.ok()).toBeTruthy();
    const editBody = (await editRes.json()) as { data: { name: string; quote: string } };
    expect(editBody.data.name).toBe('After Edit');
    expect(editBody.data.quote).toBe('Updated quote after edit!');
  });

  test('Admin can delete a testimonial via API', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    // Create
    const createRes = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: 'To Delete',
        location: 'Tangerang',
        quote: 'Will be deleted.',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = (await createRes.json()) as { data: { id: string } };

    // Delete
    const deleteRes = await request.delete(
      `${API_URL}/api/v1/admin/testimonials/${createBody.data.id}`,
      {
        headers: { Cookie: `token=${auth.token}` },
      },
    );
    expect(deleteRes.ok()).toBeTruthy();

    // Verify not found
    const getRes = await request.get(`${API_URL}/api/v1/admin/testimonials/${createBody.data.id}`, {
      headers: { Cookie: `token=${auth.token}` },
    });
    expect(getRes.status()).toBe(404);
  });

  test('Content manager can view testimonials page', async ({ page, request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.contentManager.email,
      TEST_CREDENTIALS.contentManager.password,
    );
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/admin/testimonials');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Content manager CANNOT delete a testimonial', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.contentManager.email,
      TEST_CREDENTIALS.contentManager.password,
    );

    const res = await request.delete(
      `${API_URL}/api/v1/admin/testimonials/00000000-0000-0000-0000-000000000001`,
      {
        headers: { Cookie: `token=${auth.token}` },
      },
    );
    expect(res.status()).toBe(403);
  });

  test('Testimonial visible via admin API after creation', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    const uniqueName = `Admin E2E ${Date.now()}`;
    const createRes = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: uniqueName,
        location: 'Jakarta',
        quote: 'Should appear in admin API.',
        rating: 5,
        displayOrder: 98,
        isActive: 'true',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = (await createRes.json()) as { data: { id: string } };
    createdIds.push(createBody.data.id);

    // Verify via admin API (no cache) that data was persisted
    const adminRes = await request.get(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
    });
    expect(adminRes.ok()).toBeTruthy();
    const adminBody = (await adminRes.json()) as { data: Array<{ name: string }> };
    const names = adminBody.data.map((t: { name: string }) => t.name);
    expect(names).toContain(uniqueName);
  });

  test('Inactive testimonial is hidden from public CMS API', async ({ request }) => {
    const auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );

    // Create inactive testimonial
    const inactiveName = `Inactive E2E ${Date.now()}`;
    const createRes = await request.post(`${API_URL}/api/v1/admin/testimonials`, {
      headers: { Cookie: `token=${auth.token}` },
      data: {
        name: inactiveName,
        location: 'Jakarta',
        quote: 'Should NOT appear in public CMS API.',
        rating: 3,
        isActive: 'false',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createBody = (await createRes.json()) as { data: { id: string } };
    createdIds.push(createBody.data.id);

    // Fetch from public CMS API
    const cmsRes = await request.get(`${API_URL}/api/v1/cms/testimonials`);
    expect(cmsRes.ok()).toBeTruthy();
    const cmsBody = (await cmsRes.json()) as { data: Array<{ name: string }> };
    const names = cmsBody.data.map((t: { name: string }) => t.name);
    // Even with stale CMS cache, an inactive testimonial freshly created
    // should never appear in cached or fresh responses (it was never active).
    expect(names).not.toContain(inactiveName);
  });
});
