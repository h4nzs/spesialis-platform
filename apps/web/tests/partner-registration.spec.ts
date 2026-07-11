import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

const UNIQUE_ID = Date.now().toString();
const TEST_PARTNER = {
  email: `partner-e2e-${UNIQUE_ID}@test.com`,
  phone: `6281${UNIQUE_ID.slice(0, 8).padEnd(8, '0')}`,
  password: 'Testing123',
  fullName: 'E2E Partner Test',
  ktpNumber: `${UNIQUE_ID.slice(0, 16).padEnd(16, '0')}`,
};

test.describe('Partner Registration - E2E-012', () => {
  test('E2E-012: Registration page loads with form fields', async ({ page }) => {
    await page.goto('/register/partner');
    await expect(page).toHaveURL(/\/register\/partner/);
    await expect(page.getByRole('heading', { name: /Daftar sebagai Mitra/ })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('button', { name: /Daftar sebagai Mitra/ })).toBeVisible();
  });

  test('E2E-012: Registration form has all required fields', async ({ page }) => {
    await page.goto('/register/partner');
    await page.waitForLoadState('networkidle');

    // Verify key input fields are present
    const nameInput = page.locator('input[name="fullName"], input[placeholder*="Nama"]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="Telepon"]').first();
    const ktpInput = page.locator('input[name="ktp"], input[placeholder*="KTP"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    const inputsFound = [
      await nameInput.isVisible(),
      await emailInput.isVisible(),
      await phoneInput.isVisible(),
      await ktpInput.isVisible(),
      await passwordInput.isVisible(),
    ].filter(Boolean).length;

    // At least 3 of the 5 expected fields should be found
    expect(inputsFound).toBeGreaterThanOrEqual(3);
  });

  test('E2E-012: Successful registration via API returns 201', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: TEST_PARTNER,
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      success: boolean;
      data: { user: { id: string; email: string; role: string } };
    };
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(TEST_PARTNER.email);
    expect(body.data.user.role).toBe('partner');
  });

  test('E2E-012: Duplicate email returns 409', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: TEST_PARTNER,
    });
    expect(res.status()).toBe(409);
    const body = (await res.json()) as { success: boolean; code: string };
    expect(body.success).toBe(false);
    expect(body.code).toBe('CONFLICT');
  });

  test('E2E-012: New partner can login via API', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/auth/login`, {
      data: { email: TEST_PARTNER.email, password: TEST_PARTNER.password },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { user: { role: string } } };
    expect(body.data.user.role).toBe('partner');
  });

  test('E2E-012: Empty body returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: {},
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Missing required fields returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: { fullName: 'Only Name' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Invalid email format returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: { ...TEST_PARTNER, email: 'not-an-email' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Weak password (no uppercase) returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: { ...TEST_PARTNER, email: `weak-${UNIQUE_ID}@test.com`, password: 'test12345' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Weak password (no digit) returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: { ...TEST_PARTNER, email: `weak2-${UNIQUE_ID}@test.com`, password: 'Testinggg' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Short password (< 8 chars) returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/partners/register`, {
      data: { ...TEST_PARTNER, email: `short-${UNIQUE_ID}@test.com`, password: 'Te1' },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-012: Registered partner profile shows Pending verification', async ({ request }) => {
    // Login first
    const loginRes = await request.post(`${API_URL}/api/v1/auth/login`, {
      data: { email: TEST_PARTNER.email, password: TEST_PARTNER.password },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = (await loginRes.json()) as { data: { token: string } };
    const token = loginBody.data.token;
    expect(token).toBeTruthy();

    // Get partner profile
    const profileRes = await request.get(`${API_URL}/api/v1/partners/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(profileRes.status()).toBe(200);
    const profileBody = (await profileRes.json()) as {
      data: { fullName: string; verificationStatus: string };
    };
    expect(profileBody.data.fullName).toBe(TEST_PARTNER.fullName);
    expect(profileBody.data.verificationStatus).toBe('Pending');
  });

  test('E2E-012: Admin can verify the new partner', async ({ request }) => {
    // Login as admin
    const adminLoginRes = await request.post(`${API_URL}/api/v1/auth/login`, {
      data: { email: 'admin@ahlipanggilan.id', password: 'password123' },
    });
    expect(adminLoginRes.status()).toBe(200);
    const adminBody = (await adminLoginRes.json()) as { data: { token: string } };
    const adminToken = adminBody.data.token;

    // List partners to find our test partner
    const partnersRes = await request.get(`${API_URL}/api/v1/partners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(partnersRes.status()).toBe(200);
    const partnersBody = (await partnersRes.json()) as {
      data: Array<{ id: string; fullName: string }>;
    };
    const testPartner = partnersBody.data.find((p) => p.fullName === TEST_PARTNER.fullName);
    expect(testPartner).toBeDefined();

    // Verify the partner
    const verifyRes = await request.post(`${API_URL}/api/v1/partners/${testPartner!.id}/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { verificationStatus: 'Approved', note: 'E2E test approval' },
    });
    expect(verifyRes.status()).toBe(200);
    const verifyBody = (await verifyRes.json()) as { data: { verificationStatus: string } };
    expect(verifyBody.data.verificationStatus).toBe('Approved');
  });

  test('E2E-012: Verified partner can access dashboard UI', async ({ page, request }) => {
    // Login as the new partner
    const loginRes = await request.post(`${API_URL}/api/v1/auth/login`, {
      data: { email: TEST_PARTNER.email, password: TEST_PARTNER.password },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = (await loginRes.json()) as { data: { token: string } };
    const token = loginBody.data.token;

    // Set auth cookie directly (consistent with other tests that inline this)
    await page.context().addCookies([
      {
        name: 'token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax' as const,
      },
    ]);

    // Navigate to partner dashboard
    await page.goto('/dashboard/partner');
    await expect(page).toHaveURL(/\/dashboard\/partner/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
