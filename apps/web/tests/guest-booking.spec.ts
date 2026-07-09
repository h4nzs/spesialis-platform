import { test, expect } from '@playwright/test';
import { loginViaApi, TEST_CREDENTIALS } from './helpers.ts';

const API_URL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

test.describe('Guest Booking Lifecycle', () => {
  let adminAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerAuth: Awaited<ReturnType<typeof loginViaApi>>;
  let partnerUserId: string;
  let serviceId: string;
  let bookingId: string;
  let bookingNumber: string;
  let paymentId: string;
  let paymentCreated = false;
  let guestToken: string;

  // Unique identifiers for this test run
  const uniqueId = Date.now().toString();
  const guestPhone = `6281${uniqueId.slice(0, 9).padEnd(9, '0')}`;
  const guestEmail = `guest-e2e-${uniqueId}@test.com`;
  const guestPassword = 'Testing123';
  const guestFullName = 'E2E Guest Test';

  test.beforeAll(async ({ request }) => {
    // Login admin and partner upfront
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

    // Get a valid service ID
    const svcRes = await request.get(`${API_URL}/api/v1/services?limit=1`);
    const svcBody = (await svcRes.json()) as { data?: Array<{ id: string; name: string }> };
    expect(svcBody.data).toBeDefined();
    expect(svcBody.data!.length).toBeGreaterThan(0);
    serviceId = svcBody.data![0]!.id;
    expect(serviceId).toBeDefined();
  });

  test('Step 1: Guest creates a booking with phone number', async ({ request }) => {
    expect(serviceId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings`, {
      data: {
        fullName: guestFullName,
        phone: guestPhone,
        address: {
          receiverName: guestFullName,
          receiverPhone: guestPhone,
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          postalCode: '12120',
          address: 'Jl. Guest E2E Testing No. 1',
        },
        bookingDate: '2026-07-30',
        bookingTime: '10:00',
        items: [{ serviceId, quantity: 1 }],
        notes: 'E2E guest booking lifecycle test',
      },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      data: { id: string; bookingNumber: string };
    };
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.bookingNumber).toBeDefined();
    expect(body.data.bookingNumber).toContain('SP-');
    bookingId = body.data.id;
    bookingNumber = body.data.bookingNumber;
  });

  test('Step 2: Guest can track booking and see Pending Confirmation', async ({ request }) => {
    expect(bookingNumber).toBeDefined();

    const res = await request.get(`${API_URL}/api/v1/bookings/tracking/${bookingNumber}`);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string; bookingNumber: string } };
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('Pending Confirmation');
    expect(body.data.bookingNumber).toBe(bookingNumber);
  });

  test('Step 3: Admin confirms the booking', async ({ request }) => {
    expect(bookingId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/confirm`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { finalPrice: '150000' },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('Waiting Assignment');
  });

  test('Step 4: Admin assigns partner', async ({ request }) => {
    expect(bookingId).toBeDefined();
    expect(partnerUserId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/assign`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { partnerId: partnerUserId },
    });
    expect([200, 201]).toContain(res.status());
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('Partner Assigned');
  });

  test('Step 5: Partner accepts assignment', async ({ request }) => {
    expect(bookingId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/accept`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('Partner Accepted');
  });

  test('Step 6: Partner marks on-the-way', async ({ request }) => {
    expect(bookingId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/on-the-way`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('On The Way');
  });

  test('Step 7: Partner starts working', async ({ request }) => {
    expect(bookingId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/start`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('Working');
  });

  test('Step 8: Partner completes the job', async ({ request }) => {
    expect(bookingId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/bookings/${bookingId}/complete`, {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe('Completed');
  });

  test('Step 9: Guest converts to registered account', async ({ request }) => {
    // Convert guest using the phone number used during booking
    const res = await request.post(`${API_URL}/api/v1/auth/convert-guest`, {
      data: {
        phone: guestPhone,
        email: guestEmail,
        password: guestPassword,
        fullName: guestFullName,
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      data: { user: { id: string; email: string; role: string }; token: string };
    };
    expect(body.data).toBeDefined();
    expect(body.data.user.email).toBe(guestEmail);
    expect(body.data.user.role).toBe('customer');
    expect(body.data.token).toBeDefined();

    // Store token for payment step
    guestToken = body.data.token;
  });

  test('Step 10: Converted customer submits payment', async ({ request }) => {
    expect(bookingId).toBeDefined();
    expect(guestToken).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/payments`, {
      headers: { Authorization: `Bearer ${guestToken}` },
      data: {
        orderId: bookingId,
        method: 'Transfer',
        amount: '150000',
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { data: { id: string; status: string } };
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.status).toBe('Waiting');
    paymentId = body.data.id;
    paymentCreated = true;
  });

  test('Step 11: Admin verifies payment', async ({ request }) => {
    expect(paymentCreated).toBe(true);
    expect(paymentId).toBeDefined();

    const res = await request.post(`${API_URL}/api/v1/payments/${paymentId}/verify`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
      data: { status: 'Paid' },
    });
    expect(res.status()).toBe(200);
  });

  test('Step 12: Track booking shows Paid status', async ({ request }) => {
    expect(bookingNumber).toBeDefined();

    const res = await request.get(`${API_URL}/api/v1/bookings/tracking/${bookingNumber}`);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('Paid');
  });
});
