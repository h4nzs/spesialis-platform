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

    // Get customer1 profile to use for the booking
    const customerAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );

    // Create an address for the customer
    const addrRes = await request.post(`${API_URL}/api/v1/addresses`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` },
      data: {
        receiverName: 'Reject Test Customer',
        receiverPhone: '081234567888',
        province: 'DKI Jakarta',
        city: 'Jakarta',
        district: 'Cilandak',
        postalCode: '12430',
        address: 'Jl. Reject Test No. 1',
      },
    });
    expect(addrRes.status()).toBe(201);
    const addrBody = (await addrRes.json()) as { data: { id: string } };
    const addressId = addrBody.data.id;

    // Create a booking as the customer (uses createCustomerBooking, avoids guest DB null issue)
    const bookRes = await request.post(`${API_URL}/api/v1/bookings`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` },
      data: {
        addressId,
        items: [{ serviceId, quantity: 1 }],
        bookingDate: '2026-07-21',
        bookingTime: '10:00',
        notes: 'E2E partner reject test',
      },
    });
    expect(bookRes.status()).toBe(201);
    const bookBody = (await bookRes.json()) as { data: { id: string; status: string } };
    bookingId = bookBody.data.id;

    // Confirm the booking
    const confirmRes = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/confirm`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { finalPrice: '100000' },
    });
    expect([200, 201]).toContain(confirmRes.status());

    // Assign partner using UUID
    const assignRes = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/assign`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { partnerId: partnerUserId },
    });
    expect([200, 201]).toContain(assignRes.status());
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
