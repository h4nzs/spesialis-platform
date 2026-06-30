import { Hono } from 'hono';
import { eq, and, or, desc, isNull, sql } from 'drizzle-orm';
import type { OrderStatus } from '@specialist/types';
import {
  db,
  orders,
  orderItems,
  orderStatusHistory,
  assignments,
  customerProfiles,
  addresses,
  services,
  partnerProfiles,
  users,
} from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import {
  createGuestBookingSchema,
  createCustomerBookingSchema,
  confirmBookingSchema,
  assignPartnerSchema,
  acceptAssignmentSchema,
  rejectAssignmentSchema,
} from '@specialist/validation';
import {
  success,
  created,
  error,
  notFound,
  forbidden,
  conflict,
  serverError,
} from '../lib/response.ts';

const router = new Hono();

async function getNextBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SP-${year}-`;
  const result = await db.execute(sql`
    SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number, 8) AS INTEGER)), 0) + 1 AS next
    FROM orders WHERE booking_number LIKE ${prefix + '%'}
  `);
  const row = result[0] as { next: number } | undefined;
  const next = Number(row?.next ?? 1);
  return `${prefix}${String(next).padStart(6, '0')}`;
}

async function recordStatusHistory(
  orderId: string,
  from: OrderStatus | null,
  to: OrderStatus,
  changedBy: string,
  note?: string,
) {
  await db.insert(orderStatusHistory).values({
    orderId,
    fromStatus: from,
    toStatus: to,
    changedBy: changedBy,
    note: note ?? null,
  });
}

function validTransitions(current: OrderStatus): OrderStatus[] {
  const map: Record<OrderStatus, OrderStatus[]> = {
    Draft: ['Pending Confirmation'],
    'Pending Confirmation': ['Confirmed', 'Cancelled'],
    Confirmed: ['Waiting Assignment', 'Cancelled'],
    'Waiting Assignment': ['Partner Assigned', 'Cancelled'],
    'Partner Assigned': ['Partner Accepted', 'Waiting Assignment', 'Cancelled'],
    'Partner Accepted': ['Working', 'Cancelled'],
    'On The Way': ['Working', 'Cancelled'],
    Working: ['Completed'],
    Completed: ['Waiting Payment'],
    'Waiting Payment': ['Paid'],
    Paid: ['Closed'],
    Closed: [],
    Cancelled: [],
    Rejected: [],
    Expired: [],
  };
  return map[current] ?? [];
}

router.post('/', async (c) => {
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = authHeader?.startsWith('Bearer ');

  if (isAuthenticated) {
    return await createCustomerBooking(c);
  }
  return await createGuestBooking(c);
});

async function createGuestBooking(c: import('hono').Context) {
  const body = await c.req.json();
  const parsed = createGuestBookingSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const {
    fullName,
    phone,
    address: addr,
    bookingDate,
    bookingTime,
    notes,
    items: orderItemsData,
  } = parsed.data;

  try {
    const bookingNumber = await getNextBookingNumber();

    const [profile] = await db
      .insert(customerProfiles)
      .values({
        fullName,
        guestPhone: phone,
      })
      .returning({ id: customerProfiles.id });

    if (!profile) return serverError(c, 'Gagal membuat profil');

    const [address] = await db
      .insert(addresses)
      .values({
        customerId: profile.id,
        receiverName: addr.receiverName,
        receiverPhone: addr.receiverPhone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        postalCode: addr.postalCode,
        address: addr.address,
      })
      .returning({ id: addresses.id });

    if (!address) return serverError(c, 'Gagal membuat alamat');

    const [serviceItem] = orderItemsData;
    const price = serviceItem
      ? await db
          .select({ basePrice: services.basePrice })
          .from(services)
          .where(eq(services.id, serviceItem.serviceId))
          .limit(1)
      : null;
    const basePrice = price ? Number(price[0]?.basePrice ?? 0) : 0;

    const [order] = await db
      .insert(orders)
      .values({
        bookingNumber,
        customerId: profile.id,
        addressId: address.id,
        status: 'Pending Confirmation',
        bookingDate,
        bookingTime,
        basePrice: String(basePrice),
        discountAmount: '0',
        notes: notes ?? null,
      })
      .returning({ id: orders.id });

    if (!order) return serverError(c, 'Gagal membuat booking');

    for (const item of orderItemsData) {
      const svc = await db
        .select({
          name: services.name,
          price: services.basePrice,
        })
        .from(services)
        .where(eq(services.id, item.serviceId))
        .limit(1);

      const snapName = svc[0]?.name ?? '';
      const unitPrice = item.quantity > 0 ? Number(svc[0]?.price ?? 0) : 0;

      await db.insert(orderItems).values({
        orderId: order.id,
        serviceId: item.serviceId,
        serviceNameSnapshot: snapName,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        subtotal: String(unitPrice * item.quantity),
      });
    }

    await recordStatusHistory(order.id, null, 'Pending Confirmation', 'system');

    return created(
      c,
      {
        bookingNumber,
        id: order.id,
        trackingUrl: `/api/v1/bookings/tracking/${bookingNumber}`,
      },
      'Booking berhasil dibuat',
    );
  } catch (err) {
    console.error('Guest booking failed:', err);
    return serverError(c, 'Gagal membuat booking');
  }
}

async function createCustomerBooking(c: import('hono').Context) {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = createCustomerBookingSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const { addressId, bookingDate, bookingTime, notes, items: orderItemsData } = parsed.data;

  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  if (!profile) return error(c, 'PROFILE_NOT_FOUND', 'Lengkapi profil terlebih dahulu', 400);

  const [addr] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);
  if (!addr) return error(c, 'ADDRESS_NOT_FOUND', 'Alamat tidak ditemukan', 404);

  try {
    const bookingNumber = await getNextBookingNumber();

    const [serviceItem] = orderItemsData;
    const price = serviceItem
      ? await db
          .select({ basePrice: services.basePrice })
          .from(services)
          .where(eq(services.id, serviceItem.serviceId))
          .limit(1)
      : null;
    const basePrice = price ? Number(price[0]?.basePrice ?? 0) : 0;

    const [order] = await db
      .insert(orders)
      .values({
        bookingNumber,
        customerId: profile.id,
        addressId: addressId,
        status: 'Pending Confirmation',
        bookingDate,
        bookingTime,
        basePrice: String(basePrice),
        discountAmount: '0',
        notes: notes ?? null,
      })
      .returning({ id: orders.id });

    if (!order) return serverError(c, 'Gagal membuat booking');

    for (const item of orderItemsData) {
      const svc = await db
        .select({
          name: services.name,
          price: services.basePrice,
        })
        .from(services)
        .where(eq(services.id, item.serviceId))
        .limit(1);

      const snapName = svc[0]?.name ?? '';
      const unitPrice = Number(svc[0]?.price ?? 0) * item.quantity;

      await db.insert(orderItems).values({
        orderId: order.id,
        serviceId: item.serviceId,
        serviceNameSnapshot: snapName,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        subtotal: String(unitPrice),
      });
    }

    await recordStatusHistory(order.id, null, 'Pending Confirmation', userId);

    return created(c, { bookingNumber, id: order.id }, 'Booking berhasil dibuat');
  } catch (err) {
    console.error('Customer booking failed:', err);
    return serverError(c, 'Gagal membuat booking');
  }
}

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const statusFilter = c.req.query('status');

  let query = db
    .select({
      id: orders.id,
      bookingNumber: orders.bookingNumber,
      status: orders.status,
      bookingDate: orders.bookingDate,
      bookingTime: orders.bookingTime,
      basePrice: orders.basePrice,
      finalPrice: orders.finalPrice,
      createdAt: orders.createdAt,
    })
    .from(orders);

  const conditions: ReturnType<typeof eq>[] = [];

  if (userRole === 'customer') {
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (profile) conditions.push(eq(orders.customerId, profile.id));
  } else if (userRole === 'partner') {
    const [profile] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, userId))
      .limit(1);
    if (profile) conditions.push(eq(orders.partnerId, profile.id));
  } else if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'dispatcher') {
    // admins see all
  } else {
    return forbidden(c);
  }

  if (statusFilter) conditions.push(eq(orders.status, statusFilter as OrderStatus));

  const items = await query
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return success(c, items);
});

router.get('/tracking/:bookingNumber', async (c) => {
  const bookingNumber = c.req.param('bookingNumber')!;

  const [order] = await db
    .select({
      id: orders.id,
      bookingNumber: orders.bookingNumber,
      status: orders.status,
      bookingDate: orders.bookingDate,
      bookingTime: orders.bookingTime,
      basePrice: orders.basePrice,
      finalPrice: orders.finalPrice,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.bookingNumber, bookingNumber))
    .limit(1);

  if (!order) return notFound(c, 'Booking tidak ditemukan');

  const timeline = await db
    .select({
      fromStatus: orderStatusHistory.fromStatus,
      toStatus: orderStatusHistory.toStatus,
      createdAt: orderStatusHistory.createdAt,
    })
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, order.id))
    .orderBy(orderStatusHistory.createdAt);

  return success(c, { ...order, timeline });
});

router.get('/:id', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (userRole === 'customer') {
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (!profile || order.customerId !== profile.id) return forbidden(c);
  } else if (userRole === 'partner') {
    const [profile] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, userId))
      .limit(1);
    if (!profile || order.partnerId !== profile.id) return forbidden(c);
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const timeline = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(orderStatusHistory.createdAt);

  return success(c, { ...order, items, timeline });
});

router.post('/:id/confirm', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = confirmBookingSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('Confirmed')) {
    return conflict(c, `Tidak bisa konfirmasi dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    const updateData: Record<string, unknown> = { status: 'Confirmed' };
    if (parsed.data.finalPrice !== undefined)
      updateData.finalPrice = String(parsed.data.finalPrice);
    await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

    await recordStatusHistory(orderId, order.status, 'Confirmed', userId, parsed.data.note);
  });

  return success(c, { id: orderId, status: 'Confirmed' }, 'Booking dikonfirmasi');
});

router.post(
  '/:id/assign',
  authMiddleware,
  requireRole('admin', 'super_admin', 'dispatcher'),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = assignPartnerSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Booking tidak ditemukan');

    if (!validTransitions(order.status).includes('Partner Assigned')) {
      return conflict(c, `Tidak bisa assignment dari status ${order.status}`);
    }

    const [partner] = await db
      .select({ id: partnerProfiles.id, availability: partnerProfiles.availability })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, parsed.data.partnerId))
      .limit(1);
    if (!partner) return error(c, 'PARTNER_NOT_FOUND', 'Partner tidak ditemukan', 404);

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({ status: 'Partner Assigned', partnerId: partner.id })
        .where(eq(orders.id, orderId));

      await tx.insert(assignments).values({
        orderId,
        partnerId: partner.id,
        status: 'Assigned',
      });

      await recordStatusHistory(
        orderId,
        order.status,
        'Partner Assigned',
        userId,
        parsed.data.note,
      );
    });

    return success(c, { id: orderId, status: 'Partner Assigned' }, 'Partner diassign');
  },
);

router.post('/:id/accept', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya partner yang bisa accept');

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.partnerId, profile.id)))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('Partner Accepted')) {
    return conflict(c, `Tidak bisa accept dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Partner Accepted' }).where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Accepted', acceptedAt: new Date() })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Partner Accepted', userId);
  });

  return success(c, { id: orderId, status: 'Partner Accepted' }, 'Assignment diterima');
});

router.post('/:id/reject', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = rejectAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Reason wajib diisi',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya partner yang bisa reject');

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.partnerId, profile.id)))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('Waiting Assignment')) {
    return conflict(c, `Tidak bisa reject dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: 'Waiting Assignment', partnerId: null })
      .where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Rejected', rejectedAt: new Date(), rejectionReason: parsed.data.reason })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(
      orderId,
      order.status,
      'Waiting Assignment',
      userId,
      parsed.data.reason,
    );
  });

  return success(c, { id: orderId, status: 'Waiting Assignment' }, 'Assignment ditolak');
});

router.post('/:id/start', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya partner yang bisa mulai pekerjaan');

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.partnerId, profile.id)))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('Working')) {
    return conflict(c, `Tidak bisa mulai dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Working' }).where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Completed', startedAt: new Date() })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Working', userId);
  });

  return success(c, { id: orderId, status: 'Working' }, 'Pekerjaan dimulai');
});

router.post('/:id/complete', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya partner yang bisa selesaikan pekerjaan');

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.partnerId, profile.id)))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('Completed')) {
    return conflict(c, `Tidak bisa selesaikan dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: 'Completed', completedAt: new Date() })
      .where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Completed', completedAt: new Date() })
      .where(eq(assignments.orderId, orderId));

    await recordStatusHistory(orderId, order.status, 'Completed', userId);
  });

  return success(c, { id: orderId, status: 'Completed' }, 'Pekerjaan selesai');
});

router.post('/:id/cancel', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json().catch(() => ({}));
  const reason: string = body.reason ?? '';

  const [order] = await db
    .select({ id: orders.id, status: orders.status, customerId: orders.customerId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  const userRole = c.get('userRole');
  const [profile] =
    userRole === 'customer'
      ? await db
          .select({ id: customerProfiles.id })
          .from(customerProfiles)
          .where(
            and(eq(customerProfiles.userId, userId), eq(customerProfiles.id, order.customerId)),
          )
          .limit(1)
      : [{ id: 'allowed' as const }];

  if (!profile) return forbidden(c);

  if (!validTransitions(order.status).includes('Cancelled')) {
    return conflict(c, `Tidak bisa dibatalkan dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Cancelled' }).where(eq(orders.id, orderId));
    await recordStatusHistory(orderId, order.status, 'Cancelled', userId, reason);
  });

  return success(c, { id: orderId, status: 'Cancelled' }, 'Booking dibatalkan');
});

export { router as bookingsRouter };
