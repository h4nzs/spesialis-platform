import { describe, it, expect, beforeAll } from 'vitest';
import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { hashPassword, signAccessToken } from '../lib/auth.ts';
import {
  db,
  users,
  customerProfiles,
  partnerProfiles,
  serviceCategories,
  services,
  addresses,
  orders,
  orderStatusHistory,
  assignments,
  payments,
} from '../lib/db.ts';
import { apiRouter } from '../routes/index.ts';
import { errorHandler } from '../middleware/error-handler.ts';

let app: Hono;
let customerToken: string;
let adminToken: string;
let partnerToken: string;
let customerUserId: string;
let adminUserId: string;
let partnerUserId: string;
let partnerProfileId: string;
let serviceId: string;
let addressId: string;
let bookingId: string;
let bookingNumber: string;
let paymentId: string;

beforeAll(async () => {
  app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1', apiRouter);

  // Clean existing data
  await db.execute(sql`TRUNCATE TABLE 
    notifications, reviews, complaints, payments, assignments,
    order_status_history, order_items, orders, addresses,
    partner_skills, services, service_categories, partner_profiles,
    customer_profiles, users
    RESTART IDENTITY CASCADE`);

  // Create users
  const password = await hashPassword('password123');

  const [customer] = await db
    .insert(users)
    .values({
      email: 'integration-customer@test.com',
      phone: '6281111111111',
      passwordHash: password,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });
  customerUserId = customer!.id;

  const [admin] = await db
    .insert(users)
    .values({
      email: 'integration-admin@test.com',
      phone: '6281111111112',
      passwordHash: password,
      role: 'admin',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });
  adminUserId = admin!.id;

  const [partner] = await db
    .insert(users)
    .values({
      email: 'integration-partner@test.com',
      phone: '6281111111113',
      passwordHash: password,
      role: 'partner',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });
  partnerUserId = partner!.id;

  // Create tokens
  customerToken = await signAccessToken(customerUserId, customer!.email, 'customer');
  adminToken = await signAccessToken(adminUserId, admin!.email, 'admin');
  partnerToken = await signAccessToken(partnerUserId, partner!.email, 'partner');

  // Create customer profile
  const [customerProfile] = await db
    .insert(customerProfiles)
    .values({
      userId: customerUserId,
      fullName: 'Integration Customer',
      birthDate: '1990-01-01',
    })
    .returning({ id: customerProfiles.id });

  // Create partner profile
  const [partnerProfile] = await db
    .insert(partnerProfiles)
    .values({
      userId: partnerUserId,
      fullName: 'Integration Partner',
      phone: '6281111111113',
      ktpNumber: '1234567890123456',
      experienceYear: 5,
      bio: 'Integration test partner',
      availability: 'Available',
      verificationStatus: 'Approved',
      ratingAverage: '4.5',
      completedJobs: 10,
    })
    .returning({ id: partnerProfiles.id });
  partnerProfileId = partnerProfile!.id;

  // Create service category
  const [category] = await db
    .insert(serviceCategories)
    .values({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Integration test category',
      icon: 'test',
      displayOrder: 1,
    })
    .returning({ id: serviceCategories.id });

  // Create service
  const [service] = await db
    .insert(services)
    .values({
      categoryId: category!.id,
      name: 'Test Service',
      slug: 'test-service',
      shortDescription: 'Integration test service',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });
  serviceId = service!.id;

  // Create address
  const [address] = await db
    .insert(addresses)
    .values({
      customerId: customerProfile!.id,
      label: 'Rumah',
      receiverName: 'Integration Customer',
      receiverPhone: '6281111111111',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postalCode: '12120',
      address: 'Jl. Integration Test No. 1',
      isDefault: true,
    })
    .returning({ id: addresses.id });
  addressId = address!.id;
});

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

describe('Full Booking Lifecycle', () => {
  it('1. Create booking as customer (POST /bookings) → 201', async () => {
    const res = await app.request('/api/v1/bookings', {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({
        addressId,
        bookingDate: '2026-07-20',
        bookingTime: '10:00',
        items: [{ serviceId, quantity: 2 }],
        notes: 'Integration test booking',
      }),
    });
    const body = (await res.json()) as {
      success: boolean;
      data: { id: string; bookingNumber: string; status: string };
    };
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.bookingNumber).toMatch(/^SP-2026-/);
    expect(body.data.status).toBe('Pending Confirmation');
    bookingId = body.data.id;
    bookingNumber = body.data.bookingNumber;

    // Verify order exists in DB with correct data
    const [order] = await db
      .select({ status: orders.status, basePrice: orders.basePrice })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Pending Confirmation');
    expect(Number(order!.basePrice)).toBe(300000); // 2 × 150000
  });

  it('2. Confirm booking as admin (POST /bookings/:id/confirm) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({ finalPrice: 280000, note: 'Diskon khusus' }),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Confirmed');

    // Verify DB state
    const [order] = await db
      .select({ status: orders.status, finalPrice: orders.finalPrice })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Confirmed');
    expect(Number(order!.finalPrice)).toBe(280000);

    // Verify status history
    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, bookingId))
      .orderBy(orderStatusHistory.createdAt);
    expect(history.length).toBe(2); // Created + Confirmed
    expect(history[1]!.toStatus).toBe('Confirmed');
  });

  it('3. Assign partner as admin (POST /bookings/:id/assign) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/assign`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({ partnerId: partnerUserId, note: 'Mitra terdekat' }),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Partner Assigned');

    // Verify DB state
    const [order] = await db
      .select({ status: orders.status, partnerId: orders.partnerId })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Partner Assigned');
    expect(order!.partnerId).toBe(partnerProfileId);

    // Verify assignment created
    const [assignment] = await db
      .select({ status: assignments.status })
      .from(assignments)
      .where(eq(assignments.orderId, bookingId))
      .limit(1);
    expect(assignment!.status).toBe('Assigned');
  });

  it('4. Accept assignment as partner (POST /bookings/:id/accept) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/accept`, {
      method: 'POST',
      headers: headers(partnerToken),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Partner Accepted');

    // Verify DB state
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Partner Accepted');

    const [assignment] = await db
      .select({ status: assignments.status, acceptedAt: assignments.acceptedAt })
      .from(assignments)
      .where(eq(assignments.orderId, bookingId))
      .limit(1);
    expect(assignment!.status).toBe('Accepted');
    expect(assignment!.acceptedAt).toBeTruthy();
  });

  it('5. Set partner on-the-way (POST /bookings/:id/on-the-way) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/on-the-way`, {
      method: 'POST',
      headers: headers(partnerToken),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('On The Way');
  });

  it('6. Start work as partner (POST /bookings/:id/start) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/start`, {
      method: 'POST',
      headers: headers(partnerToken),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Working');

    // Verify assignment startedAt
    const [assignment] = await db
      .select({ startedAt: assignments.startedAt })
      .from(assignments)
      .where(eq(assignments.orderId, bookingId))
      .limit(1);
    expect(assignment!.startedAt).toBeTruthy();
  });

  it('7. Complete work as partner (POST /bookings/:id/complete) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/complete`, {
      method: 'POST',
      headers: headers(partnerToken),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Completed');

    // Verify DB state
    const [order] = await db
      .select({ status: orders.status, completedAt: orders.completedAt })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Completed');
    expect(order!.completedAt).toBeTruthy();
  });

  it('8. Submit payment as customer (POST /payments) → 201', async () => {
    const res = await app.request('/api/v1/payments', {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({
        orderId: bookingId,
        method: 'Transfer',
        amount: 280000,
        notes: 'Pembayaran via BCA',
      }),
    });
    const body = (await res.json()) as { success: boolean; data: { id: string; status: string } };
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Waiting');
    paymentId = body.data.id;

    // Verify order moved to Waiting Payment
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Waiting Payment');
  });

  it('9. Verify payment as admin (POST /payments/:id/verify) → 200', async () => {
    const res = await app.request(`/api/v1/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Paid');

    // Verify final DB state
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, bookingId))
      .limit(1);
    expect(order!.status).toBe('Paid');

    const [paymentRecord] = await db
      .select({ status: payments.status, verifiedBy: payments.verifiedBy })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);
    expect(paymentRecord!.status).toBe('Paid');
    expect(paymentRecord!.verifiedBy).toBe(adminUserId);

    // Verify complete status history
    const history = await db
      .select({ toStatus: orderStatusHistory.toStatus })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, bookingId))
      .orderBy(orderStatusHistory.createdAt);
    const statuses = history.map((h) => h.toStatus);
    expect(statuses).toEqual([
      'Pending Confirmation',
      'Confirmed',
      'Partner Assigned',
      'Partner Accepted',
      'On The Way',
      'Working',
      'Completed',
      'Waiting Payment',
      'Paid',
    ]);
  });

  it('10. Track booking (GET /bookings/tracking/:bookingNumber) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/tracking/${bookingNumber}`);
    const body = (await res.json()) as {
      success: boolean;
      data: { bookingNumber: string; status: string; timeline: unknown[] };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.bookingNumber).toBe(bookingNumber);
    expect(body.data.status).toBe('Paid');
    expect(Array.isArray(body.data.timeline)).toBe(true);
    expect(body.data.timeline.length).toBe(9);
  });

  it('11. Get booking detail as customer (GET /bookings/:id) → 200', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}`, {
      headers: headers(customerToken),
    });
    const body = (await res.json()) as {
      success: boolean;
      data: { id: string; items: unknown[]; timeline: unknown[] };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(bookingId);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.length).toBe(1);
    expect(Array.isArray(body.data.timeline)).toBe(true);
    expect(body.data.timeline.length).toBe(9);
  });
});

describe('Validation & Error Cases', () => {
  it('Rejects booking with empty body (422)', async () => {
    const res = await app.request('/api/v1/bookings', {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('Rejects confirm from non-admin role (403)', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({ finalPrice: 100000 }),
    });
    expect(res.status).toBe(403);
  });

  it('Rejects assign from non-admin role (403)', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}/assign`, {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({ partnerId: partnerUserId }),
    });
    expect(res.status).toBe(403);
  });

  it('Rejects invalid status transition (409)', async () => {
    // Booking is already Paid, try to confirm again
    const res = await app.request(`/api/v1/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({ finalPrice: 100000 }),
    });
    expect(res.status).toBe(409);
  });

  it('Rejects unauthenticated access (401)', async () => {
    const res = await app.request(`/api/v1/bookings/${bookingId}`);
    expect(res.status).toBe(401);
  });

  it('Returns 404 for non-existent booking', async () => {
    const res = await app.request('/api/v1/bookings/00000000-0000-0000-0000-000000000000', {
      headers: headers(adminToken),
    });
    expect(res.status).toBe(404);
  });
});
