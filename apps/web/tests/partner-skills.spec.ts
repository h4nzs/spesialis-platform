import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Partner Skills Management - E2E-024', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;
  let categoryId: string;
  let skillId: string;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );

    // Get a valid service category ID for the skill
    const catRes = await request.get(`${API_URL}/api/v1/service-categories`);
    expect(catRes.status()).toBe(200);
    const catBody = (await catRes.json()) as { data?: Array<{ id: string; name: string }> };
    expect(catBody.data).toBeDefined();
    expect(catBody.data!.length).toBeGreaterThan(0);
    categoryId = catBody.data![0]!.id;
  });

  test('E2E-024: Partner settings page loads', async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/partner/settings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('E2E-024: Partner can add a skill via API', async ({ request }) => {
    expect(categoryId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        categoryId,
        proficiency: 'Advanced',
      },
    });
    expect([200, 201]).toContain(res.status());
    const body = (await res.json()) as {
      data: { id: string; categoryId: string; proficiency: string };
    };
    expect(body.data).toBeDefined();
    expect(body.data.categoryId).toBe(categoryId);
    expect(body.data.proficiency).toBe('Advanced');
    skillId = body.data.id;
  });

  test('E2E-024: Partner can list their skills', async ({ request }) => {
    expect(categoryId).toBeDefined();
    const res = await request.get(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: Array<{ id: string; categoryId: string; categoryName: string; proficiency: string }>;
    };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    // The skill we just added should appear in the list
    const addedSkill = body.data.find((s) => s.categoryId === categoryId);
    expect(addedSkill).toBeDefined();
    expect(addedSkill!.proficiency).toBe('Advanced');
  });

  test('E2E-024: Skill list shows category name', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: Array<{ id: string; categoryName: string }> };
    const addedSkill = body.data.find((s) => s.id === skillId);
    expect(addedSkill).toBeDefined();
    expect(addedSkill!.categoryName).toBeTruthy();
  });

  test('E2E-024: Duplicate skill returns 409 conflict', async ({ request }) => {
    expect(categoryId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        categoryId,
        proficiency: 'Expert',
      },
    });
    expect(res.status()).toBe(409);
  });

  test('E2E-024: Invalid categoryId returns 422 validation error', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        categoryId: 'not-a-uuid',
        proficiency: 'Beginner',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-024: Unauthenticated access returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/partners/me/skills`);
    expect(res.status()).toBe(401);
  });

  test('E2E-024: Partner can delete a skill', async ({ request }) => {
    expect(skillId).toBeDefined();
    const res = await request.delete(`${API_URL}/api/v1/partners/me/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(200);

    // Verify skill is removed from list
    const listRes = await request.get(`${API_URL}/api/v1/partners/me/skills`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const body = (await listRes.json()) as { data: Array<{ id: string }> };
    const removed = body.data.find((s) => s.id === skillId);
    expect(removed).toBeUndefined();
  });

  test('E2E-024: Deleting non-existent skill returns 404', async ({ request }) => {
    expect(skillId).toBeDefined();
    const res = await request.delete(`${API_URL}/api/v1/partners/me/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(404);
  });
});
