import { describe, it, expect, beforeAll } from 'vitest';
import { Hono } from 'hono';
import { hashPassword } from '../lib/auth.ts';
import {
  db,
  users,
  customerProfiles,
  partnerProfiles,
  serviceCategories,
  services,
  orders,
  orderItems,
  addresses,
  reviews,
} from '../lib/db.ts';
import { apiRouter } from '../routes/index.ts';
import { errorHandler } from '../middleware/error-handler.ts';

let app: Hono;

// Shared IDs seeded in beforeAll
let serviceWithReviewsId: string;
let serviceWithReviewsSlug: string;
let serviceWithOrdersNoReviewsId: string;
let serviceWithOrdersNoReviewsSlug: string;
let serviceNoOrdersId: string;
let serviceNoOrdersSlug: string;

beforeAll(async () => {
  process.env['RATE_LIMIT_DISABLED'] = 'true';

  app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1', apiRouter);

  // Use unique data — do NOT truncate (shares DB container with other integration tests)
  const password = await hashPassword('password123');

  const [customer] = await db
    .insert(users)
    .values({
      email: 'svc-reviews-customer@test.com',
      phone: '6281010101010',
      passwordHash: password,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id });
  const customerUserId = customer!.id;

  const [partner] = await db
    .insert(users)
    .values({
      email: 'svc-reviews-partner@test.com',
      phone: '6281010101011',
      passwordHash: password,
      role: 'partner',
      status: 'active',
    })
    .returning({ id: users.id });
  const partnerUserId = partner!.id;

  const [customerProfile] = await db
    .insert(customerProfiles)
    .values({
      userId: customerUserId,
      fullName: 'Svc Reviews Customer',
      birthDate: '1990-01-01',
    })
    .returning({ id: customerProfiles.id });

  const [partnerProfile] = await db
    .insert(partnerProfiles)
    .values({
      userId: partnerUserId,
      fullName: 'Svc Reviews Partner',
      phone: '6281010101011',
      ktpNumber: '1234567890123456',
      experienceYear: 3,
      bio: 'Integration test partner for service reviews',
      availability: 'Available',
      verificationStatus: 'Approved',
      ratingAverage: '4.8',
      completedJobs: 20,
    })
    .returning({ id: partnerProfiles.id });
  const partnerProfileId = partnerProfile!.id;

  const [category] = await db
    .insert(serviceCategories)
    .values({
      name: 'Reviews Test Category',
      slug: 'reviews-test-category',
      description: 'Category for service reviews integration tests',
      icon: 'test',
      displayOrder: 1,
    })
    .returning({ id: serviceCategories.id });

  const [svcWithReviews] = await db
    .insert(services)
    .values({
      categoryId: category!.id,
      name: 'Service With Reviews',
      slug: 'service-with-reviews',
      shortDescription: 'Service that has reviews',
      basePrice: '100000',
      estimatedDuration: 30,
      isFeatured: false,
      displayOrder: 1,
    })
    .returning({ id: services.id });
  serviceWithReviewsId = svcWithReviews!.id;
  serviceWithReviewsSlug = 'service-with-reviews';

  const [svcOrdersNoReviews] = await db
    .insert(services)
    .values({
      categoryId: category!.id,
      name: 'Service Orders No Reviews',
      slug: 'service-orders-no-reviews',
      shortDescription: 'Has orders but no reviews',
      basePrice: '200000',
      estimatedDuration: 45,
      isFeatured: false,
      displayOrder: 2,
    })
    .returning({ id: services.id });
  serviceWithOrdersNoReviewsId = svcOrdersNoReviews!.id;
  serviceWithOrdersNoReviewsSlug = 'service-orders-no-reviews';

  const [svcNoOrders] = await db
    .insert(services)
    .values({
      categoryId: category!.id,
      name: 'Service No Orders',
      slug: 'service-no-orders',
      shortDescription: 'Has no orders at all',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: false,
      displayOrder: 3,
    })
    .returning({ id: services.id });
  serviceNoOrdersId = svcNoOrders!.id;
  serviceNoOrdersSlug = 'service-no-orders';

  const [address] = await db
    .insert(addresses)
    .values({
      customerId: customerProfile!.id,
      label: 'Rumah',
      receiverName: 'Svc Reviews Customer',
      receiverPhone: '6281010101010',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postalCode: '12120',
      address: 'Jl. Integration Test No. 1',
      isDefault: true,
    })
    .returning({ id: addresses.id });

  // Order 1: for service-with-reviews
  const [order1] = await db
    .insert(orders)
    .values({
      bookingNumber: 'SP-INT-R1',
      customerId: customerProfile!.id,
      addressId: address!.id,
      status: 'Paid',
      bookingDate: '2026-06-01',
      bookingTime: '09:00',
      basePrice: '100000',
      finalPrice: '100000',
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: order1!.id,
    serviceId: serviceWithReviewsId,
    serviceNameSnapshot: 'Service With Reviews',
    quantity: 1,
    unitPrice: '100000',
    subtotal: '100000',
  });

  // Order 2: also for service-with-reviews
  const [order2] = await db
    .insert(orders)
    .values({
      bookingNumber: 'SP-INT-R2',
      customerId: customerProfile!.id,
      addressId: address!.id,
      status: 'Paid',
      bookingDate: '2026-06-02',
      bookingTime: '10:00',
      basePrice: '100000',
      finalPrice: '100000',
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: order2!.id,
    serviceId: serviceWithReviewsId,
    serviceNameSnapshot: 'Service With Reviews',
    quantity: 2,
    unitPrice: '100000',
    subtotal: '200000',
  });

  // Order 3: for service-orders-no-reviews — no review will be added
  const [order3] = await db
    .insert(orders)
    .values({
      bookingNumber: 'SP-INT-NR',
      customerId: customerProfile!.id,
      addressId: address!.id,
      status: 'Completed',
      partnerId: partnerProfileId,
      bookingDate: '2026-06-03',
      bookingTime: '11:00',
      basePrice: '200000',
      finalPrice: '180000',
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: order3!.id,
    serviceId: serviceWithOrdersNoReviewsId,
    serviceNameSnapshot: 'Service Orders No Reviews',
    quantity: 1,
    unitPrice: '200000',
    subtotal: '200000',
  });

  // Review 1: 5-star from order1
  await db.insert(reviews).values({
    orderId: order1!.id,
    customerId: customerProfile!.id,
    partnerId: partnerProfileId,
    rating: '5.0',
    review: 'Layanan sangat memuaskan! Teknisi datang tepat waktu.',
  });

  // Review 2: 4-star from order2
  await db.insert(reviews).values({
    orderId: order2!.id,
    customerId: customerProfile!.id,
    partnerId: partnerProfileId,
    rating: '4.0',
    review: 'Pelayanan baik, harga sesuai.',
  });
});

describe('GET /api/v1/services/:identifier/reviews (integration)', () => {
  it('Returns reviews and aggregate for service with reviews', async () => {
    const res = await app.request(`/api/v1/services/${serviceWithReviewsId}/reviews`);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        items: { id: string; rating: string; review: string | null; createdAt: string }[];
        aggregate: { averageRating: number; totalReviews: number };
      };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.aggregate.averageRating).toBeCloseTo(4.5, 1);
    expect(body.data.aggregate.totalReviews).toBe(2);

    const ratings = body.data.items.map((r) => Number(r.rating)).sort();
    expect(ratings).toEqual([4.0, 5.0]);

    const reviewsText = body.data.items.map((r) => r.review);
    expect(reviewsText).toEqual(
      expect.arrayContaining([
        'Layanan sangat memuaskan! Teknisi datang tepat waktu.',
        'Pelayanan baik, harga sesuai.',
      ]),
    );
  });

  it('Returns empty when service has orders but no reviews', async () => {
    const res = await app.request(`/api/v1/services/${serviceWithOrdersNoReviewsId}/reviews`);
    const body = (await res.json()) as {
      success: boolean;
      data: { items: unknown[]; aggregate: { averageRating: number; totalReviews: number } };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(0);
    expect(body.data.aggregate.totalReviews).toBe(0);
    expect(body.data.aggregate.averageRating).toBe(0);
  });

  it('Returns empty when service has no orders', async () => {
    const res = await app.request(`/api/v1/services/${serviceNoOrdersId}/reviews`);
    const body = (await res.json()) as {
      success: boolean;
      data: { items: unknown[]; aggregate: { averageRating: number; totalReviews: number } };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(0);
    expect(body.data.aggregate.totalReviews).toBe(0);
    expect(body.data.aggregate.averageRating).toBe(0);
  });

  it('Works with slug lookup (same result as ID)', async () => {
    const res = await app.request(`/api/v1/services/${serviceWithReviewsSlug}/reviews`);
    const body = (await res.json()) as {
      success: boolean;
      data: { items: unknown[]; aggregate: { totalReviews: number } };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.aggregate.totalReviews).toBe(2);
  });

  it('Returns 404 for non-existent UUID', async () => {
    const res = await app.request('/api/v1/services/00000000-0000-0000-0000-000000000000/reviews');
    const body = (await res.json()) as { success: boolean; message: string };
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('Returns 404 for non-existent slug', async () => {
    const res = await app.request('/api/v1/services/tidak-ada-service-ini/reviews');
    const body = (await res.json()) as { success: boolean; message: string };
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});
