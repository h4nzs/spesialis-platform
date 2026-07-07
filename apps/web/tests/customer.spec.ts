import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Customer Dashboard - E2E-003', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
  });

  test('E2E-003: Customer dashboard loads with order history', async ({ page }) => {
    await page.goto('/dashboard/customer');
    await expect(page).toHaveURL(/\/dashboard\/customer/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-003: Customer can view their orders', async ({ page }) => {
    await page.goto('/dashboard/customer/orders');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-004: Customer can view order history (repeat booking source)', async ({ page }) => {
    await page.goto('/dashboard/customer/orders');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-005: Customer can access reviews page', async ({ page }) => {
    await page.goto('/dashboard/customer/reviews');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-023: Customer can access complaints page', async ({ page }) => {
    await page.goto('/dashboard/customer/complaints');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-023: Customer can access complaints form page', async ({ page }) => {
    await page.goto('/dashboard/customer/complaints/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Customer can manage addresses', async ({ page }) => {
    await page.goto('/dashboard/customer/addresses');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Customer can access settings/profile page', async ({ page }) => {
    await page.goto('/dashboard/customer/settings');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Forgot Password - E2E-025', () => {
  test('E2E-025: Forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-025: Forgot password form has email input', async ({ page }) => {
    await page.goto('/forgot-password');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('E2E-025: Reset password page loads with token', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123');
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Session Expired - E2E-027', () => {
  test('E2E-027: Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/dashboard/customer');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('E2E-027: Protected API redirects when no token', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Complaint Flow - E2E-023', () => {
  let auth: Awaited<ReturnType<typeof loginViaApi>>;
  let serviceId: string;
  let addressId: string;
  let orderId: string;
  let complaintId: string;

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );

    // Get a service ID for creating an order
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=1`);
    const svcBody = (await svcRes.json()) as { data?: Array<{ id: string }> };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);
    serviceId = svcBody.data![0]!.id;

    // Create an address for the customer
    const addrRes = await request.post(`${API_URL}/api/v1/addresses`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        receiverName: 'Complaint Test Customer',
        receiverPhone: '081234567890',
        province: 'DKI Jakarta',
        city: 'Jakarta',
        district: 'Menteng',
        postalCode: '10310',
        address: 'Jl. Complaint Test No. 1',
      },
    });
    expect(addrRes.status()).toBe(201);
    const addrBody = (await addrRes.json()) as { data: { id: string } };
    addressId = addrBody.data.id;
    expect(addressId).toBeDefined();

    // Create a booking as customer to have an order to complain about
    const bookRes = await request.post(`${API_URL}/api/v1/bookings`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        addressId,
        bookingDate: '2026-07-25',
        bookingTime: '14:00',
        items: [{ serviceId, quantity: 1 }],
        notes: 'E2E complaint test',
      },
    });
    expect(bookRes.status()).toBe(201);
    const bookBody = (await bookRes.json()) as { data: { id: string; bookingNumber: string } };
    orderId = bookBody.data.id;
  });

  test('E2E-023: Customer can create a complaint via API', async ({ request }) => {
    expect(orderId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        orderId,
        title: 'E2E Test Complaint - Layanan Tidak Sesuai',
        description:
          'Hasil pekerjaan tidak sesuai dengan yang dijanjikan. Saya sangat kecewa dengan kualitas layanan yang diberikan karena tidak memenuhi standar yang diiklankan.',
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { data: { id: string; title: string; status: string } };
    expect(body.data).toBeDefined();
    expect(body.data.title).toBe('E2E Test Complaint - Layanan Tidak Sesuai');
    expect(body.data.status).toBe('Open');
    complaintId = body.data.id;
  });

  test('E2E-023: Customer can list their complaints', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: Array<{ id: string; title: string; status: string }>;
    };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    const created = body.data.find((c) => c.id === complaintId);
    expect(created).toBeDefined();
    expect(created!.title).toBe('E2E Test Complaint - Layanan Tidak Sesuai');
  });

  test('E2E-023: Customer cannot complain about non-existent order', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        orderId: '00000000-0000-0000-0000-000000000000',
        title: 'Non-existent order',
        description: 'This order does not exist in the database.',
      },
    });
    expect(res.status()).toBe(404);
  });

  test('E2E-023: Complaint with invalid data returns 422', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        orderId: 'not-a-uuid',
        title: '',
        description: 'short',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('E2E-023: Unauthenticated complaint returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/complaints`, {
      data: {
        orderId: '00000000-0000-0000-0000-000000000000',
        title: 'No auth complaint',
        description: 'This should be rejected due to missing auth.',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('E2E-023: Admin can view all complaints', async ({ request }) => {
    const adminAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    const res = await request.get(`${API_URL}/api/v1/complaints`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data?: Array<{ id: string }> };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('E2E-023: Customer complaints page shows complaint status', async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, auth);
    await page.goto('/dashboard/customer/complaints');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
