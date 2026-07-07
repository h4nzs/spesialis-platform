import { Hono } from 'hono';
import type { Context } from 'hono';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import type { OrderStatus, PaginationMeta } from '@specialist/types';
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
  companyUsers,
  media,
  orderMedia,
} from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { verifyAccessToken } from '../lib/auth.ts';
import {
  createGuestBookingSchema,
  createCustomerBookingSchema,
  confirmBookingSchema,
  assignPartnerSchema,
  rejectAssignmentSchema,
} from '@specialist/validation';
import {
  success,
  successPaginated,
  created,
  error,
  notFound,
  forbidden,
  conflict,
  serverError,
  unauthorized,
} from '../lib/response.ts';
import { createAuditLog } from '../lib/audit.ts';
import { createNotification, notifyAdmins } from '../lib/notification.ts';
import { APP_URL, sendBookingConfirmationEmail, sendPartnerAssignedEmail } from '../lib/email.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';

const router = new Hono();

async function getNextBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SP-${year}-`;
  const result = await db.execute(sql`
    SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number, 9) AS INTEGER)), 0) + 1 AS next
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
  changedBy: string | null,
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
    Confirmed: ['Waiting Assignment', 'Partner Assigned', 'Cancelled'],
    'Waiting Assignment': ['Partner Assigned', 'Cancelled'],
    'Partner Assigned': ['Partner Accepted', 'Waiting Assignment', 'Cancelled'],
    'Partner Accepted': ['On The Way', 'Cancelled'],
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

router.post('/', rateLimit(5, 60_000), async (c) => {
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = authHeader?.startsWith('Bearer ');

  if (isAuthenticated) {
    return await createCustomerBooking(c);
  }
  return await createGuestBooking(c);
});

async function attachMediaToOrder(orderId: string, mediaIds: string[], uploadedBy?: string) {
  if (!mediaIds?.length) return;

  const existing = await db
    .select({ id: media.id })
    .from(media)
    .where(
      uploadedBy
        ? and(inArray(media.id, mediaIds), eq(media.uploadedBy, uploadedBy))
        : inArray(media.id, mediaIds),
    );

  const found = new Set(existing.map((m) => m.id));
  const invalid = mediaIds.filter((id) => !found.has(id));
  if (invalid.length > 0) {
    throw new Error(`Media tidak ditemukan: ${invalid.join(', ')}`);
  }

  await db.insert(orderMedia).values(mediaIds.map((mediaId) => ({ orderId, mediaId })));
}

async function createGuestBooking(c: Context) {
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
    mediaIds,
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

    const serviceIds = orderItemsData.map((i) => i.serviceId);
    const prices = serviceIds.length
      ? await db
          .select({ id: services.id, price: services.basePrice })
          .from(services)
          .where(inArray(services.id, serviceIds))
      : [];
    const priceMap = new Map(prices.map((s) => [s.id, Number(s.price ?? 0)]));
    const basePrice = orderItemsData.reduce(
      (sum, item) => sum + (priceMap.get(item.serviceId) ?? 0) * item.quantity,
      0,
    );

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

    if (mediaIds?.length) {
      await attachMediaToOrder(order.id, mediaIds);
    }

    await recordStatusHistory(order.id, null, 'Pending Confirmation', null);

    notifyAdmins('booking.new', 'Booking Baru', `Booking baru #${bookingNumber} dari ${fullName}`);

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
    const message = err instanceof Error ? err.message : 'Gagal membuat booking';
    console.error('Guest booking failed:', err);
    return error(c, 'MEDIA_VALIDATION_ERROR', message, 422);
  }
}

async function createCustomerBooking(c: Context) {
  // Verify JWT — route doesn't use authMiddleware (supports both guest & auth)
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return unauthorized(c, 'Missing authentication token');

  let userId: string;
  try {
    const payload = await verifyAccessToken(token);
    userId = payload.sub;
  } catch {
    return unauthorized(c, 'Invalid or expired token');
  }

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

  const {
    addressId,
    bookingDate,
    bookingTime,
    notes,
    items: orderItemsData,
    mediaIds,
  } = parsed.data;

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

    const serviceIds = orderItemsData.map((i) => i.serviceId);
    const prices = serviceIds.length
      ? await db
          .select({ id: services.id, price: services.basePrice })
          .from(services)
          .where(inArray(services.id, serviceIds))
      : [];
    const priceMap = new Map(prices.map((s) => [s.id, Number(s.price ?? 0)]));
    const basePrice = orderItemsData.reduce(
      (sum, item) => sum + (priceMap.get(item.serviceId) ?? 0) * item.quantity,
      0,
    );

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

    if (mediaIds?.length) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      await attachMediaToOrder(order.id, mediaIds, user?.id);
    }

    await recordStatusHistory(order.id, null, 'Pending Confirmation', userId);

    notifyAdmins('booking.new', 'Booking Baru', `Booking baru #${bookingNumber} dari customer`);

    createNotification({
      userId,
      type: 'booking.created',
      title: 'Booking Berhasil',
      message: `Booking #${bookingNumber} berhasil dibuat. Menunggu konfirmasi admin.`,
    });

    return created(
      c,
      { bookingNumber, id: order.id, status: 'Pending Confirmation' },
      'Booking berhasil dibuat',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat booking';
    console.error('Customer booking failed:', err);
    return error(c, 'MEDIA_VALIDATION_ERROR', message, 422);
  }
}

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const statusFilter = c.req.query('status');

  const query = db
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
  } else if (userRole === 'corporate') {
    const [cu] = await db
      .select({ companyId: companyUsers.companyId })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userId))
      .limit(1);
    if (cu) conditions.push(eq(orders.companyId, cu.companyId));
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

  const countResult = items.length
    ? await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    : [{ count: 0 }];
  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return successPaginated(c, items, pagination);
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

  const attachedMedia = await db
    .select({
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      extension: media.extension,
      size: media.size,
      url: sql`'/api/v1/media/' || ${media.id} || '/file'`,
    })
    .from(orderMedia)
    .innerJoin(media, eq(media.id, orderMedia.mediaId))
    .where(eq(orderMedia.orderId, orderId));

  return success(c, { ...order, items, media: attachedMedia, timeline });
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

  await createAuditLog(c, {
    userId,
    action: 'booking.confirm',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Confirmed', finalPrice: parsed.data.finalPrice },
    oldValue: { status: order.status },
  });

  try {
    const [customerInfo] = await db
      .select({
        email: users.email,
        fullName: customerProfiles.fullName,
        userId: users.id,
        bookingNumber: orders.bookingNumber,
      })
      .from(orders)
      .innerJoin(customerProfiles, eq(customerProfiles.id, orders.customerId))
      .leftJoin(users, eq(users.id, customerProfiles.userId))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (customerInfo?.email && customerInfo?.bookingNumber) {
      sendBookingConfirmationEmail(
        customerInfo.email,
        customerInfo.fullName ?? 'Pelanggan',
        customerInfo.bookingNumber,
        `${APP_URL}/tracking`,
      );
    }

    if (customerInfo?.userId) {
      createNotification({
        userId: customerInfo.userId,
        type: 'booking.confirmed',
        title: 'Booking Dikonfirmasi',
        message: `Booking #${customerInfo.bookingNumber} telah dikonfirmasi.`,
      });
    }
  } catch {
    // Email is non-critical — proceed
  }

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

    await createAuditLog(c, {
      userId,
      action: 'booking.assign',
      entity: 'order',
      entityId: orderId,
      newValue: { status: 'Partner Assigned', partnerId: partner.id },
      oldValue: { status: order.status },
    });

    const [partnerUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, parsed.data.partnerId))
      .limit(1);
    if (partnerUser) {
      await createNotification({
        userId: partnerUser.id,
        type: 'booking.assigned',
        title: 'Pekerjaan Baru',
        message: `Anda ditugaskan pada order #${orderId}`,
      });

      if (partnerUser.email) {
        const [partnerDetail] = await db
          .select({ fullName: partnerProfiles.fullName, bookingNumber: orders.bookingNumber })
          .from(orders)
          .innerJoin(partnerProfiles, eq(partnerProfiles.id, orders.partnerId!))
          .where(eq(orders.id, orderId))
          .limit(1);

        if (partnerDetail?.bookingNumber) {
          sendPartnerAssignedEmail(
            partnerUser.email,
            partnerDetail.fullName,
            partnerDetail.bookingNumber,
            `${APP_URL}/dashboard/partner/jobs`,
          );
        }
      }
    }

    return success(c, { id: orderId, status: 'Partner Assigned' }, 'Partner berhasil diassign');
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

  await createAuditLog(c, {
    userId,
    action: 'booking.accept',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Partner Accepted' },
    oldValue: { status: order.status },
  });

  return success(c, { id: orderId, status: 'Partner Accepted' }, 'Assignment diterima');
});

router.post('/:id/on-the-way', authMiddleware, async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: partnerProfiles.id })
    .from(partnerProfiles)
    .where(eq(partnerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya partner yang bisa update status');

  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.partnerId, profile.id)))
    .limit(1);
  if (!order) return notFound(c, 'Booking tidak ditemukan');

  if (!validTransitions(order.status).includes('On The Way')) {
    return conflict(c, `Tidak bisa update dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'On The Way' }).where(eq(orders.id, orderId));

    await recordStatusHistory(orderId, order.status, 'On The Way', userId);
  });

  const [customerInfo] = await db
    .select({ userId: users.id })
    .from(orders)
    .innerJoin(customerProfiles, eq(customerProfiles.id, orders.customerId))
    .leftJoin(users, eq(users.id, customerProfiles.userId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (customerInfo?.userId) {
    createNotification({
      userId: customerInfo.userId,
      type: 'booking.on-the-way',
      title: 'Partner Menuju Lokasi',
      message: 'Partner sedang dalam perjalanan menuju lokasi Anda.',
    });
  }

  return success(c, { id: orderId, status: 'On The Way' }, 'Partner dalam perjalanan');
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

  await createAuditLog(c, {
    userId,
    action: 'booking.reject',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Waiting Assignment', rejectionReason: parsed.data.reason },
    oldValue: { status: order.status },
  });

  notifyAdmins(
    'booking.rejected',
    'Partner Menolak Assignment',
    `Partner menolak assignment untuk order #${orderId}. Alasan: ${parsed.data.reason}`,
  );

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
      .set({ startedAt: new Date() })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Working', userId);
  });

  await createAuditLog(c, {
    userId,
    action: 'booking.start',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Working' },
    oldValue: { status: order.status },
  });

  const [customerInfo] = await db
    .select({ userId: users.id, bookingNumber: orders.bookingNumber })
    .from(orders)
    .innerJoin(customerProfiles, eq(customerProfiles.id, orders.customerId))
    .leftJoin(users, eq(users.id, customerProfiles.userId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (customerInfo?.userId) {
    await createNotification({
      userId: customerInfo.userId,
      type: 'booking.in-progress',
      title: 'Pekerjaan Dimulai',
      message: `Pekerjaan untuk booking #${customerInfo.bookingNumber} telah dimulai.`,
    });
  }

  notifyAdmins(
    'booking.in-progress',
    'Pekerjaan Dimulai',
    `Partner memulai pekerjaan untuk booking #${orderId}`,
  );

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
    .select({ id: orders.id, status: orders.status, customerId: orders.customerId })
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

  await createAuditLog(c, {
    userId,
    action: 'booking.complete',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Completed' },
    oldValue: { status: order.status },
  });

  const [cp] = await db
    .select({ userId: customerProfiles.userId })
    .from(customerProfiles)
    .where(eq(customerProfiles.id, order.customerId))
    .limit(1);
  if (cp?.userId) {
    await createNotification({
      userId: cp.userId,
      type: 'booking.completed',
      title: 'Pekerjaan Selesai',
      message: `Pekerjaan untuk booking #${orderId} telah selesai. Silakan lakukan pembayaran.`,
    });
  }

  notifyAdmins(
    'booking.completed',
    'Pekerjaan Selesai',
    `Partner menyelesaikan pekerjaan untuk booking #${orderId}`,
  );

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

  await createAuditLog(c, {
    userId,
    action: 'booking.cancel',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Cancelled', reason },
    oldValue: { status: order.status, role: userRole },
  });

  const [customerUser] = await db
    .select({ id: users.id })
    .from(orders)
    .innerJoin(customerProfiles, eq(customerProfiles.id, orders.customerId))
    .innerJoin(users, eq(users.id, customerProfiles.userId))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (customerUser?.id) {
    createNotification({
      userId: customerUser.id,
      type: 'booking.cancelled',
      title: 'Booking Dibatalkan',
      message: `Booking #${orderId} telah dibatalkan.`,
    });
  }

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    notifyAdmins(
      'booking.cancelled',
      'Booking Dibatalkan',
      `Booking #${orderId} dibatalkan oleh ${userRole === 'partner' ? 'mitra' : 'pelanggan'}. Alasan: ${reason || 'tidak ada'}`,
    );
  }

  return success(c, { id: orderId, status: 'Cancelled' }, 'Booking dibatalkan');
});

export { router as bookingsRouter };
