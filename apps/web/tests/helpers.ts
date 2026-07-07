import type { Page, APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000';

export interface AuthData {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName?: string;
  };
}

/**
 * Login via API and get JWT token + user data.
 * Used to set up authenticated state before navigating.
 */
export async function loginViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthData> {
  const res = await request.post(`${API_URL}/api/v1/auth/login`, {
    data: { email, password },
  });

  if (!res.ok()) {
    throw new Error(`Login failed for ${email}: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as {
    data: { token: string; user: { id: string; email: string; role: string } };
  };

  return {
    token: body.data.token,
    user: body.data.user,
  };
}

/**
 * Set auth cookie on the page so subsequent navigations are authenticated.
 */
export async function setAuthCookie(page: Page, auth: AuthData): Promise<void> {
  await page.context().addCookies([
    {
      name: 'token',
      value: auth.token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax' as const,
    },
  ]);
}

/**
 * Create a guest booking via API and return the booking details.
 */
export async function createBookingViaApi(
  request: APIRequestContext,
  bookingData: {
    serviceId?: string;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    bookingDate: string;
    bookingTime: string;
    notes?: string;
  },
): Promise<BookingResult> {
  const res = await request.post(`${API_URL}/api/v1/bookings`, {
    data: {
      serviceId: bookingData.serviceId ?? 'skip',
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      address: bookingData.address,
      city: bookingData.city,
      bookingDate: bookingData.bookingDate,
      bookingTime: bookingData.bookingTime,
      notes: bookingData.notes ?? '',
    },
  });

  if (!res.ok()) {
    throw new Error(`Booking failed: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as {
    data: { bookingNumber: string; id: string; status: string };
  };

  return body.data;
}

/**
 * Get a service by slug from the public API.
 */
export async function getServiceBySlug(request: APIRequestContext, slug: string) {
  const res = await request.get(`${API_URL}/api/v1/services?slug=${slug}`);
  if (!res.ok()) return null;
  const body = (await res.json()) as { data: Array<{ id: string; name: string; slug: string }> };
  return body.data?.[0] ?? null;
}

/**
 * Get a list of services for booking flow testing.
 */
export async function getServices(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/api/v1/services?limit=5`);
  if (!res.ok()) return [];
  const body = (await res.json()) as {
    data: Array<{ id: string; name: string; slug: string; basePrice: string }>;
  };
  return body.data ?? [];
}

/**
 * Track an order by booking number.
 */
export async function trackBooking(request: APIRequestContext, bookingNumber: string) {
  const res = await request.get(`${API_URL}/api/v1/bookings/tracking/${bookingNumber}`);
  if (!res.ok()) return null;
  const body = (await res.json()) as { data: Record<string, unknown> };
  return body.data;
}

export const TEST_CREDENTIALS = {
  admin: { email: 'admin@spesialis.id', password: 'password123', role: 'super_admin' },
  admin2: { email: 'admin2@spesialis.id', password: 'password123', role: 'admin' },
  dispatcher: { email: 'dispatcher@spesialis.id', password: 'password123', role: 'dispatcher' },
  finance: { email: 'finance@spesialis.id', password: 'password123', role: 'finance' },
  contentManager: {
    email: 'content@spesialis.id',
    password: 'password123',
    role: 'content_manager',
  },
  partner1: { email: 'partner@spesialis.id', password: 'password123', role: 'partner' },
  partner2: { email: 'partner2@spesialis.id', password: 'password123', role: 'partner' },
  customer1: { email: 'customer@spesialis.id', password: 'password123', role: 'customer' },
  customer2: { email: 'customer2@spesialis.id', password: 'password123', role: 'customer' },
  corporate: { email: 'corporate@spesialis.id', password: 'password123', role: 'corporate' },
} as const;
