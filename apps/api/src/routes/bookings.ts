import { Hono } from 'hono';
import type { Context } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { OrderStatus } from '@ahlipanggilan/types';
import {
  db,
  orders,
  orderItems,
  orderStatusHistory,
  assignments,
  customerProfiles,
  addresses,
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
  cancelBookingSchema,
} from '@ahlipanggilan/validation';
import { canTransition } from '@ahlipanggilan/shared';
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
import { recordStatusHistory } from '../lib/order-status.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { createNotification, notifyAdmins } from '../lib/notification.ts';
import { APP_URL, sendBookingConfirmationEmail, sendPartnerAssignedEmail } from '../lib/email.ts';
import { sendWhatsApp } from '../lib/whatsapp.ts';
import { generateBookingNumber } from '../lib/booking-number.ts';
import { createOrderTransaction } from '../lib/create-order.ts';
import { parseBody } from '../lib/parse-body.ts';
import { omitUndefined } from '../lib/update.ts';
import { validateBody } from '../middleware/validation.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';

const router = new Hono();

router.post('/', rateLimit(5, 60_000), async (c) => {
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = authHeader?.startsWith('Bearer ');

  if (isAuthenticated) {
    return await createCustomerBooking(c);
  }
  return await createGuestBooking(c);
});

async function createGuestBooking(c: Context) {
  const parsed = await parseBody(c, createGuestBookingSchema);
  if (!parsed.ok) return parsed.response;

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
    const bookingNumber = await generateBookingNumber();

    const result = await db.transaction(async (tx) => {
      // ── 1. Create guest customer profile ────────────────
      const [profile] = await tx
        .insert(customerProfiles)
        .values({
          fullName,
          guestPhone: phone,
        })
        .returning({ id: customerProfiles.id });

      if (!profile) throw new Error('Gagal membuat profil');

      // ── 2. Create address from inline data ──────────────
      const [addressRecord] = await tx
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
        .returning({
          id: addresses.id,
          address: addresses.address,
          district: addresses.district,
          city: addresses.city,
          province: addresses.province,
        });

      if (!addressRecord) throw new Error('Gagal membuat alamat');

      // ── 3. Delegate order / items / media / history ────
      const orderResult = await createOrderTransaction({
        bookingNumber,
        customerId: profile.id,
        addressId: addressRecord.id,
        bookingDate,
        bookingTime,
        notes,
        items: orderItemsData,
        mediaIds,
        changedBy: null,
        mediaOwnershipUserId: null,
        tx, // reuse the outer transaction
      });

      return { ...orderResult, addressRecord };
    });

    // Notifications — outside transaction, non-critical
    notifyAdmins(
      'booking.new',
      'Booking Baru',
      `Booking baru #${result.bookingNumber} dari ${fullName}`,
      {
        bookingNumber: result.bookingNumber,
        customerName: fullName,
        customerPhone: phone,
        address: `${result.addressRecord.address}, ${result.addressRecord.district}, ${result.addressRecord.city}, ${result.addressRecord.province}`,
        bookingDate,
        bookingTime,
        notes: notes ?? null,
        items: result.items,
      },
    );

    // Send WhatsApp to guest with booking details (silent if API key not configured)
    sendWhatsApp(
      phone,
      `Terima kasih ${fullName}! Booking Anda dengan nomor ${result.bookingNumber} telah dibuat. Lacak status: ${APP_URL}/tracking/${result.bookingNumber}`,
    );

    return created(
      c,
      {
        bookingNumber: result.bookingNumber,
        id: result.orderId,
        trackingUrl: `/api/v1/bookings/tracking/${result.bookingNumber}`,
      },
      'Booking berhasil dibuat',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat booking';
    console.error('Guest booking failed:', err);
    if (message.includes('Media tidak ditemukan')) {
      return error(c, 'MEDIA_VALIDATION_ERROR', message, 422);
    }
    return serverError(c, 'Gagal membuat booking');
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

  const parsed = await parseBody(c, createCustomerBookingSchema);
  if (!parsed.ok) return parsed.response;

  const {
    addressId,
    bookingDate,
    bookingTime,
    notes,
    items: orderItemsData,
    mediaIds,
  } = parsed.data;

  // ── Fetch customer profile, user info, and validate address ──
  const [profile] = await db
    .select({ id: customerProfiles.id, fullName: customerProfiles.fullName })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  if (!profile) return error(c, 'PROFILE_NOT_FOUND', 'Lengkapi profil terlebih dahulu', 400);

  const [customerUser] = await db
    .select({ email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [addr] = await db
    .select({
      id: addresses.id,
      address: addresses.address,
      district: addresses.district,
      city: addresses.city,
      province: addresses.province,
    })
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);
  if (!addr) return error(c, 'ADDRESS_NOT_FOUND', 'Alamat tidak ditemukan', 404);

  try {
    const bookingNumber = await generateBookingNumber();

    // ── Core order creation (single, shared helper) ────────────
    const result = await createOrderTransaction({
      bookingNumber,
      customerId: profile.id,
      addressId,
      bookingDate,
      bookingTime,
      notes,
      items: orderItemsData,
      mediaIds,
      changedBy: userId,
      mediaOwnershipUserId: userId,
    });

    // Notifications — outside transaction, non-critical
    notifyAdmins(
      'booking.new',
      'Booking Baru',
      `Booking baru #${result.bookingNumber} dari ${profile.fullName}`,
      {
        bookingNumber: result.bookingNumber,
        customerName: profile.fullName,
        customerPhone: customerUser?.phone ?? '-',
        address: `${addr.address}, ${addr.district}, ${addr.city}, ${addr.province}`,
        bookingDate,
        bookingTime,
        notes: notes ?? null,
        items: result.items,
      },
    );

    createNotification({
      userId,
      type: 'booking.created',
      title: 'Booking Berhasil',
      message: `Booking #${result.bookingNumber} berhasil dibuat. Menunggu konfirmasi admin.`,
    });

    return created(
      c,
      { bookingNumber: result.bookingNumber, id: result.orderId, status: 'Pending Confirmation' },
      'Booking berhasil dibuat',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat booking';
    console.error('Customer booking failed:', err);
    if (message.includes('Media tidak ditemukan')) {
      return error(c, 'MEDIA_VALIDATION_ERROR', message, 422);
    }
    return serverError(c, 'Gagal membuat booking');
  }
}

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const statusFilter = c.req.query('status');
  const searchQuery = c.req.query('search');

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

  if (searchQuery) {
    conditions.push(sql`${orders.bookingNumber} ILIKE ${'%' + searchQuery + '%'}`);
  }

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
  const pagination = buildPaginationMeta(page, limit, total);

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

router.post(
  '/:id/confirm',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(confirmBookingSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as { finalPrice?: number; note?: string };

    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Booking tidak ditemukan');

    // Guard: verify the booking can be confirmed (state machine: Pending Confirmation → Confirmed)
    // The transaction skips to 'Waiting Assignment' because there is no separate endpoint to
    // move a confirmed booking into the assignment queue.
    if (!canTransition(order.status, 'Confirmed')) {
      return conflict(c, `Tidak bisa konfirmasi dari status ${order.status}`);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          status: 'Waiting Assignment',
          ...omitUndefined({
            finalPrice: data.finalPrice !== undefined ? String(data.finalPrice) : undefined,
          }),
        })
        .where(eq(orders.id, orderId));

      await recordStatusHistory(orderId, order.status, 'Waiting Assignment', userId, data.note, tx);
    });

    await createAuditLog(c, {
      userId,
      action: 'booking.confirm',
      entity: 'order',
      entityId: orderId,
      newValue: { status: 'Waiting Assignment', finalPrice: data.finalPrice },
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

    return success(c, { id: orderId, status: 'Waiting Assignment' }, 'Booking dikonfirmasi');
  },
);

router.post(
  '/:id/assign',
  authMiddleware,
  requireRole('admin', 'super_admin', 'dispatcher'),
  validateBody(assignPartnerSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as { partnerId: string; note?: string };

    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Booking tidak ditemukan');

    if (!canTransition(order.status, 'Partner Assigned')) {
      return conflict(c, `Tidak bisa assignment dari status ${order.status}`);
    }

    const [partner] = await db
      .select({ id: partnerProfiles.id, availability: partnerProfiles.availability })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, data.partnerId))
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

      await recordStatusHistory(orderId, order.status, 'Partner Assigned', userId, data.note, tx);
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
      .where(eq(users.id, data.partnerId))
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

  if (!canTransition(order.status, 'Partner Accepted')) {
    return conflict(c, `Tidak bisa accept dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Partner Accepted' }).where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Accepted', acceptedAt: new Date() })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Partner Accepted', userId, undefined, tx);
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

  if (!canTransition(order.status, 'On The Way')) {
    return conflict(c, `Tidak bisa update dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'On The Way' }).where(eq(orders.id, orderId));

    await recordStatusHistory(orderId, order.status, 'On The Way', userId, undefined, tx);
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

router.post('/:id/reject', authMiddleware, validateBody(rejectAssignmentSchema), async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const data = c.get('validated') as { reason: string };

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

  if (!canTransition(order.status, 'Waiting Assignment')) {
    return conflict(c, `Tidak bisa reject dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: 'Waiting Assignment', partnerId: null })
      .where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ status: 'Rejected', rejectedAt: new Date(), rejectionReason: data.reason })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Waiting Assignment', userId, data.reason, tx);
  });

  await createAuditLog(c, {
    userId,
    action: 'booking.reject',
    entity: 'order',
    entityId: orderId,
    newValue: { status: 'Waiting Assignment', rejectionReason: data.reason },
    oldValue: { status: order.status },
  });

  notifyAdmins(
    'booking.rejected',
    'Partner Menolak Assignment',
    `Partner menolak assignment untuk order #${orderId}. Alasan: ${data.reason}`,
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

  if (!canTransition(order.status, 'Working')) {
    return conflict(c, `Tidak bisa mulai dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Working' }).where(eq(orders.id, orderId));
    await tx
      .update(assignments)
      .set({ startedAt: new Date() })
      .where(and(eq(assignments.orderId, orderId), eq(assignments.partnerId, profile.id)));

    await recordStatusHistory(orderId, order.status, 'Working', userId, undefined, tx);
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

  if (!canTransition(order.status, 'Completed')) {
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

    await recordStatusHistory(orderId, order.status, 'Completed', userId, undefined, tx);
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

router.post('/:id/cancel', authMiddleware, validateBody(cancelBookingSchema), async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const { reason } = c.get('validated') as { reason: string };

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

  if (!canTransition(order.status, 'Cancelled')) {
    return conflict(c, `Tidak bisa dibatalkan dari status ${order.status}`);
  }

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: 'Cancelled' }).where(eq(orders.id, orderId));
    await recordStatusHistory(orderId, order.status, 'Cancelled', userId, reason, tx);
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
