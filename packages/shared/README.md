# @ahlipanggilan/shared

## Purpose

Berisi kode yang digunakan bersama oleh seluruh aplikasi.
Pure TypeScript — tidak bergantung pada framework apapun.

---

## Contents

### Constants (`constants.ts`)

Business constants & type-safe helper functions:

- `ORDER_STATUSES`, `ACTIVE_ORDER_STATUSES`, `FINAL_ORDER_STATUSES`, `ORDER_STATUS_TRANSITIONS`
- `ROLES`, `ADMIN_ROLES`, `STAFF_ROLES`
- `PAYMENT_METHODS`, `PAYMENT_STATUSES`, `ASSIGNMENT_STATUSES`, `COMPLAINT_STATUSES`
- `PARTNER_AVAILABILITY`, `PARTNER_VERIFICATION_STATUSES`, `COMPANY_STATUSES`
- `NOTIFICATION_CHANNELS`, `BOOKING_NUMBER_PREFIX`, `MAX_FILE_SIZE_MB`
- Helper functions: `canTransition()`, `isOrderActive()`, `isOrderFinal()`, `isAdminRole()`, `isStaffRole()`

### API Client (`api-client.ts`)

Typed HTTP client untuk komunikasi dengan Hono API:

- `ApiClient` class — `get<T>()`, `post<T>()`, `patch<T>()`, `put<T>()`, `delete<T>()`, `getPaginated<T>()`
- Auto refresh token rotation (retry 401)
- `MemoryTokenStore` — untuk SSR / server-side
- `LocalStorageTokenStore` — untuk browser
- `createBrowserClient()` / `createServerClient()` factory functions

### Errors (`errors.ts`)

- `ApiClientError` — error dari response API yang terparsing (code, status, validation errors)
- `NetworkError` — network failure
- `SessionExpiredError` — token expired / refresh gagal
- `RequestAbortedError` — request dibatalkan via AbortController

### Helpers (`helpers/`)

| Module          | Functions                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatter.ts`  | `formatCurrency()`, `parseCurrency()`, `formatPhone()`, `formatBookingNumber()`, `parseBookingNumber()`, `formatDate()`, `formatTime()`, `formatDuration()`, `formatRating()` |
| `date.ts`       | `parseBookingDateTime()`, `isBookingPast()`, `isWithinHours()`, `daysBetween()`, `addDays()`, `getDateRange()`                                                                |
| `validation.ts` | `mapZodIssues()`, `isValidUUID()`, `isValidEmail()`, `isValidIndonesianPhone()`, `isValidFileSize()`, `isValidFileType()`, `truncate()`, `slugify()`                          |

### Utilities (`utils/`)

| Module          | Functions                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permission.ts` | `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`, `getPermissionsForRole()`, `getRoleHierarchy()`, `compareRoles()`, `canManageRole()`, `DEFAULT_PERMISSIONS` |
| `booking.ts`    | `validateStatusChange()`, `canCustomerCancel()`, `getNextStatuses()`, `getStatusLabel()`, `getStatusColor()`                                                                |
| `logger.ts`     | `Logger` class, `logger` (default instance), `createLogger()`                                                                                                               |

---

## Usage

```ts
// API Client (browser)
import { createBrowserClient } from '@ahlipanggilan/shared';
const api = createBrowserClient();
const services = await api.get<Service[]>('/api/v1/services');
const booking = await api.post<Order>('/api/v1/bookings', { body: {...} });

// API Client (SSR)
import { createServerClient } from '@ahlipanggilan/shared';
const api = createServerClient(token, refreshToken);
const orders = await api.getPaginated<Order>('/api/v1/bookings', {
  params: { page: 1, limit: 20, status: 'Pending Confirmation' },
});

// Constants
import { canTransition, isAdminRole } from '@ahlipanggilan/shared';

// Formatters
import { formatCurrency, formatDate } from '@ahlipanggilan/shared';

// Permission check
import { hasPermission } from '@ahlipanggilan/shared';
if (hasPermission(userRole, 'booking.confirm')) { ... }

// Logger
import { logger, createLogger } from '@ahlipanggilan/shared';
logger.info('Booking created', { id: order.id });
```

---

## Development

```bash
pnpm --filter @ahlipanggilan/shared typecheck
```
