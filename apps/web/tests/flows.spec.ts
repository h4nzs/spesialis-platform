import { test, expect } from '@playwright/test';
import { loginViaApi, TEST_CREDENTIALS } from './helpers.ts';

const API_URL = 'http://localhost:3000';

test.describe('Cross Module Flow', () => {
  let adminAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let customerAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerUserId: string;
  let serviceId: string;
  let addressId: string;
  let bookingId: string;
  let bookingNumber: string;
  let paymentId: string;
  let paymentCreated = false;

  test.beforeAll(async ({ request }) => {
    // Login all roles upfront
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
    customerAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.customer1.email,
      TEST_CREDENTIALS.customer1.password,
    );

    // Get partner user UUID via GET /api/v1/partners/me
    const partnerMeRes = await request.get(`${API_URL}/api/v1/partners/me`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(partnerMeRes.status()).toBe(200);
    const partnerMeBody = (await partnerMeRes.json()) as { data: { userId: string } };
    partnerUserId = partnerMeBody.data.userId;
    expect(partnerUserId).toBeDefined();

    // Get a valid service ID
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=1`);
    const svcBody = (await svcRes.json()) as { data?: Array<{ id: string; name: string }> };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);
    serviceId = svcBody.data![0]!.id;

    // Create an address for the customer
    const addrRes = await request.post(`${API_URL}/api/v1/addresses`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` },
      data: {
        receiverName: 'E2E Test Customer',
        receiverPhone: '081234567899',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        postalCode: '12120',
        address: 'Jl. E2E Testing No. 1',
      },
    });
    expect(addrRes.status()).toBe(201);
    const addrBody = (await addrRes.json()) as { data: { id: string } };
    addressId = addrBody.data.id;
    expect(addressId).toBeDefined();
  });

  test('Step 1: Create booking as customer', async ({ request }) => {
    expect(addressId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` },
      data: {
        addressId,
        bookingDate: '2026-07-20',
        bookingTime: '09:00',
        items: [{ serviceId, quantity: 1 }],
        notes: 'E2E cross-module test',
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      data: { id: string; bookingNumber: string; status: string };
    };
    expect(body.data).toBeDefined();
    bookingId = body.data.id;
    bookingNumber = body.data.bookingNumber;
    expect(body.data.status).toBe('Pending Confirmation');
  });

  test('Step 2: Admin confirms booking', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/confirm`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { finalPrice: '150000' },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 3: Admin assigns partner (using UUID)', async ({ request }) => {
    expect(bookingId).toBeDefined();
    expect(partnerUserId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/assign`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { partnerId: partnerUserId },
    });
    // Accept 200 or 201
    expect([200, 201]).toContain(res.status());
  });

  test('Step 4: Partner accepts assignment', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/accept`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 5: Partner marks on-the-way', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/on-the-way`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 6: Partner starts working', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/start`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 7: Partner completes job', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/complete`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 8: Customer submits payment', async ({ request }) => {
    expect(bookingId).toBeDefined();
    const res = await request.post(`${API_URL}/api/v1/payments`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` },
      data: {
        orderId: bookingId,
        method: 'Transfer',
        amount: '150000',
      },
    });
    expect(res.status()).toBe(201);
    const paymentBody = (await res.json()) as { data: { id: string; status: string } };
    paymentId = paymentBody.data.id;
    paymentCreated = true;
  });

  test('Step 9: Admin verifies payment', async ({ request }) => {
    expect(paymentCreated).toBe(true);
    expect(paymentId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/payments/${paymentId}/verify`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { status: 'Paid' },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 10: Customer can track booking', async ({ request }) => {
    expect(bookingNumber).toBeDefined();
    const res = await request.get(`${API_URL}/api/v1/bookings/tracking/${bookingNumber}`);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('Paid');
  });
});
