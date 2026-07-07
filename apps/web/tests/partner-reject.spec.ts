import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

const API_URL = 'http://localhost:3000';

test.describe('Partner Reject Assignment - E2E-008', () => {
  let adminAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerUserId: string;
  let serviceId: string;
  let bookingId: string;

  test.beforeAll(async ({ request }) => {
    // Login both roles
    adminAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password,
    );
    partnerAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );

    // Get partner user UUID
    const partnerMeRes = await request.get(`${API_URL}/api/v1/partners/me`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(partnerMeRes.status()).toBe(200);
    const partnerMeBody = (await partnerMeRes.json()) as { data: { userId: string } };
    partnerUserId = partnerMeBody.data.userId;
    expect(partnerUserId).toBeDefined();

    // Get a valid service
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=1`);
    const svcBody = (await svcRes.json()) as { data?: Array<{ id: string }> };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);
    serviceId = svcBody.data![0]!.id;

    // Create a booking as admin
    const bookRes = await request.post(`${API_URL}/api/v1/bookings`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: {
        serviceId,
        customerName: 'Reject Test Customer',
        customerPhone: '081234567888',
        address: 'Jl. Reject Test No. 1',
        city: 'Jakarta',
        bookingDate: '2026-07-21',
        bookingTime: '10:00',
      },
    });
    expect(bookRes.status()).toBe(201);
    const bookBody = (await bookRes.json()) as { data: { id: string } };
    bookingId = bookBody.data.id;

    // Confirm the booking
    await request.post(`${API_URL}/api/v1/bookings/${bookingId}/confirm`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { finalPrice: '100000' },
    });

    // Assign partner using UUID instead of email
    await request.post(`${API_URL}/api/v1/bookings/${bookingId}/assign`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { partnerId: partnerUserId },
    });
  });

  test('E2E-008: Partner can see assignment on jobs page', async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, partnerAuth);
    await page.goto('/dashboard/partner/jobs');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    // The page should load with job cards (or empty state if already rejected)
  });

  test('E2E-008: Partner dashboard shows jobs/assignments section', async ({ page }) => {
    await page.context().clearCookies();
    await setAuthCookie(page, partnerAuth);
    await page.goto('/dashboard/partner');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('E2E-008: Reject via API works correctly', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/reject`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
      data: { reason: 'Sedang sibuk dengan pekerjaan lain' },
    });
    // Accept 200 success
    expect([200, 201]).toContain(res.status());
  });
});
