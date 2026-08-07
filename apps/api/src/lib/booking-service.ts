import { db, customerProfiles, addresses } from './db.ts';
import { createOrderTransaction } from './create-order.ts';
import { generateBookingNumber } from './booking-number.ts';
import { notifyAdmins } from './notification.ts';
import { APP_URL } from './email.ts';
import { sendWhatsApp } from './whatsapp.ts';

/**
 * Shared guest booking creation service.
 *
 * Dipakai oleh route `POST /api/v1/bookings` (guest) dan MCP tool
 * `create_booking` agar logika bisnis tidak diduplikasi.
 */

export interface GuestBookingAddressInput {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
}

export interface CreateGuestBookingInput {
  fullName: string;
  phone: string;
  address: GuestBookingAddressInput;
  bookingDate: string;
  bookingTime: string;
  notes?: string | null;
  items: Array<{ serviceId: string; quantity: number }>;
  mediaIds?: string[];
}

export interface CreateGuestBookingResult {
  bookingNumber: string;
  orderId: string;
  addressRecord: {
    id: string;
    address: string;
    district: string;
    city: string;
    province: string;
  };
}

export async function createGuestBooking(
  input: CreateGuestBookingInput,
): Promise<CreateGuestBookingResult> {
  const {
    fullName,
    phone,
    address: addr,
    bookingDate,
    bookingTime,
    notes,
    items,
    mediaIds,
  } = input;
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
      items,
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

  return {
    bookingNumber: result.bookingNumber,
    orderId: result.orderId,
    addressRecord: result.addressRecord,
  };
}
