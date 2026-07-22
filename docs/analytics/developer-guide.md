# Developer Guide

## Quick Start

### 1. Bootstrap at App Startup

In your app's entry point (`apps/web/src/layouts/BaseLayout.astro`), the analytics SDK is already initialized via:

```astro
<script>
  import '../analytics/client.ts'
</script>
```

The bootstrap file (`apps/web/src/analytics/client.ts`) calls:

```ts
import { analyticsInit } from '@spesialis/analytics';

analyticsInit({
  providers: {
    plausible: {
      enabled: !!import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN,
      options: {
        domain: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN,
        siteDomain: import.meta.env.PUBLIC_SITE_DOMAIN ?? 'ahlipanggilan.id',
      },
      priority: 10,
    },
  },
  autoTracking: {
    pageview: true,
    scroll: true,
    engagement: true,
    outboundLinks: true,
    downloads: true,
    errors: true,
    performance: true,
    visibility: true,
    historyNavigation: true,
  },
});
```

### 2. Track Events

**Basic tracking:**

```ts
import { track } from '@spesialis/analytics';

track('cta_click', {
  section: 'hero',
  cta: 'Pesan Sekarang',
  position: 1,
  page: '/',
});
```

**Using domain helpers:**

```ts
import { trackBookingStart, trackPaymentSuccess } from '@spesialis/analytics';

trackBookingStart('srv-001', 'guest');
trackPaymentSuccess('bk-001', 150000, 'transfer', 'pay-001');
```

**From Astro component scripts:**

```astro
<script>
  import { trackCTA } from '../../analytics/astro-track.ts'

  document.getElementById('btn-cta')?.addEventListener('click', () => {
    trackCTA('hero', 'Booking', 1, '/')
  })
</script>
```

**Using the React hook:**

```tsx
import { useAnalytics } from '@spesialis/analytics';

function BookingButton({ serviceId }: { serviceId: string }) {
  const { track } = useAnalytics();
  return (
    <button
      onClick={() =>
        track('cta_click', {
          section: 'service',
          cta: 'Booking',
          position: 1,
          page: `/services/${serviceId}`,
        })
      }
    >
      Booking
    </button>
  );
}
```

### 3. Debug in Development

Press **Ctrl+Shift+A** (or Cmd+Shift+A) to toggle the floating debug panel. You can also enable debug mode:

```ts
// In analytics/client.ts — set debug: import.meta.env.DEV
analyticsInit({
  debug: import.meta.env.DEV,
  // ...
});
```

---

## Integration Status — apps/web

### Bootstrap & Auto-Tracking

| Feature                               | File                      | Status                                       |
| ------------------------------------- | ------------------------- | -------------------------------------------- |
| SDK bootstrap                         | `src/analytics/client.ts` | ✅ `analyticsInit()` with Plausible provider |
| Pageviews                             | `BaseLayout.astro`        | ✅ Plausible `<script defer>` tag            |
| Scroll depth (25/50/75/90/100%)       | auto via SDK              | ✅ `initAutoTracking()`                      |
| Page engagement (30s intervals)       | auto via SDK              | ✅                                           |
| Outbound links                        | auto via SDK              | ✅                                           |
| Downloads (PDF, doc, zip, etc.)       | auto via SDK              | ✅                                           |
| window.onerror + unhandledrejection   | auto via SDK              | ✅                                           |
| Core Web Vitals (LCP, CLS, FID, TTFB) | auto via SDK              | ✅                                           |
| Visibility change (tab switch)        | auto via SDK              | ✅                                           |
| History navigation (back/forward/SPA) | auto via SDK              | ✅                                           |
| Session start / end                   | auto via SDK              | ✅                                           |

### Public Site — Component Tracking

| Component                             | File                          | Event                       | Helper                           | Section  |
| ------------------------------------- | ----------------------------- | --------------------------- | -------------------------------- | -------- |
| Hero — Booking button                 | `Hero.astro`                  | `cta_click`                 | `trackCTA()`                     | hero     |
| Hero — Lihat Selengkapnya             | `Hero.astro`                  | `cta_click`                 | `trackCTA()`                     | hero     |
| WhatsApp floating button              | `WhatsAppFloating.astro`      | `whatsapp_click`            | `trackWhatsappClick()`           | floating |
| Footer navigation links               | `Footer.astro`                | `navigation_click`          | `trackNavigation()`              | footer   |
| FAQ homepage                          | `FAQSection.astro`            | `faq_open`                  | `trackFAQOpen()`                 | homepage |
| Booking form — on mount               | `BookingForm.tsx`             | `booking_start`             | `trackBookingStart()`            | —        |
| Booking form — on submit success      | `BookingForm.tsx`             | `booking_submit`            | `trackBookingSubmit()`           | —        |
| Corporate inquiry — on submit success | `CorporateInquiryForm.tsx`    | `inquiry_submit`            | `trackInquirySubmit()`           | —        |
| Partner registration — on mount       | `PartnerRegistrationForm.tsx` | `partner_register_start`    | `trackPartnerRegister()`         | —        |
| Partner registration — on success     | `PartnerRegistrationForm.tsx` | `partner_register_complete` | `trackPartnerRegisterComplete()` | —        |

### Dashboard — Navigation Tracking

| Component                         | File                    | Event              | Helper                 | Section           |
| --------------------------------- | ----------------------- | ------------------ | ---------------------- | ----------------- |
| Sidebar — all nav links           | `Sidebar.tsx`           | `navigation_click` | `trackNavigation()`    | sidebar           |
| Mobile bottom nav — all nav links | `MobileBottomNav.tsx`   | `navigation_click` | `trackNavigation()`    | mobile-bottom-nav |
| Dashboard page view (all roles)   | `DashboardLayout.astro` | `dashboard_view`   | `trackDashboardView()` | —                 |

### Dashboard — Action Tracking

| Component            | Action               | File                      | Event                         |
| -------------------- | -------------------- | ------------------------- | ----------------------------- |
| Admin bookings       | Confirm booking      | `AdminBookings.tsx`       | `booking_confirm`             |
| Admin bookings       | Assign partner       | `AdminBookings.tsx`       | `booking_assign`              |
| Admin bookings       | Cancel booking       | `AdminBookings.tsx`       | `booking_cancel`              |
| Admin bookings       | Export CSV           | `AdminBookings.tsx`       | `dashboard_export`            |
| Admin bookings       | Change page filter   | `AdminBookings.tsx`       | `dashboard_filter`            |
| Partner jobs         | Accept job           | `PartnerJobs.tsx`         | `partner_job_accept`          |
| Partner jobs         | Reject job           | `PartnerJobs.tsx`         | `partner_job_reject`          |
| Customer complaints  | Submit complaint     | `ComplaintForm.tsx`       | `complaint_submit`            |
| Customer orders      | View order list      | `CustomerOrders.tsx`      | `booking_list_view`           |
| Customer reviews     | Start writing review | `CustomerReviews.tsx`     | `review_start`                |
| Customer reviews     | Submit review        | `CustomerReviews.tsx`     | `review_submit`               |
| Partner availability | Update status        | `PartnerAvailability.tsx` | `partner_availability_update` |

### Public Site — Search Tracking

| Component                                | File              | Event           | Properties                             |
| ---------------------------------------- | ----------------- | --------------- | -------------------------------------- |
| Services search (on search results load) | `ServiceList.tsx` | `search_result` | `{ query, result_count, has_results }` |

### Not Yet Integrated (Backlog)

| Component | Suggested Event | Priority                   |
| --------- | --------------- | -------------------------- |
| —         | —               | ✅ All tracking integrated |

---

## Available Helpers

```ts
// Navigation
trackNavigation(destination: string, label: string, section?: string): void

// Homepage / Landing
trackCTA(section: string, cta: string, position: number, page: string): void
trackWhatsappClick(source: string, page: string): void
trackServiceView(serviceId: string, category: string, slug: string): void

// Search
trackSearch(query: string, resultCount: number): void

// Booking
trackBookingStart(serviceId: string, customerType: 'guest' | 'registered'): void
trackBookingSubmit(serviceId: string, bookingId: string, customerType: 'guest' | 'registered'): void
trackBookingCancel(bookingId: string, reason?: string): void

// Payment
trackPaymentSuccess(bookingId: string, amount: number, method: string, paymentId: string): void
trackPaymentFailed(bookingId: string, amount: number, method: string, error?: string): void

// Authentication
trackRegisterComplete(userId: string, role: string): void
trackLoginSuccess(userId: string, role: string): void

// Partner
trackPartnerRegister(): void
trackPartnerRegisterComplete(partnerId: string): void
trackPartnerJobAccept(assignmentId: string, bookingId: string): void
trackPartnerJobReject(assignmentId: string, bookingId: string, reason: string): void

// Corporate
trackInquirySubmit(companyName: string, serviceInterest: string, opts?: { industry?: string; employees?: number }): void

// CMS
trackArticleView(articleId: string, category: string, slug: string): void
trackFAQOpen(faqId: string, question: string, category: string): void

// Dashboard
trackDashboardView(role: string, section: string): void

// Errors
track404(path: string, referrer?: string): void
trackAPIError(endpoint: string, status: number, method: string): void
```

---

## Automatic Tracking

Call `initAutoTracking()` (or use `analyticsInit()`) to enable:

- **Pageview**: Initial + SPA navigation (pushState/popstate)
- **Scroll Depth**: 25%, 50%, 75%, 90%, 100%
- **Engagement**: 30-second interaction intervals
- **Outbound Links**: External link clicks
- **Downloads**: File downloads (PDF, doc, zip, etc.)
- **Errors**: `window.onerror` + `unhandledrejection`
- **Core Web Vitals**: LCP, CLS (SPA-aware), FID, TTFB
- **Visibility**: Tab switch tracking
- **History Navigation**: Back/forward/SPA navigation
- **Session End**: Tab close/navigate away

Configure which features to enable:

```ts
initAutoTracking({
  pageview: true,
  scroll: true,
  engagement: true,
  outboundLinks: true,
  downloads: false,
  errors: true,
  performance: true,
  visibility: true,
  historyNavigation: true,
});
```

---

## Env Vars

| Env Var                   | Required   | Default            | Description                                               |
| ------------------------- | ---------- | ------------------ | --------------------------------------------------------- |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Yes (prod) | —                  | Plausible server hostname (e.g. `stats.ahlipanggilan.id`) |
| `PUBLIC_SITE_DOMAIN`      | Yes        | `ahlipanggilan.id` | Site domain for `data-domain` attribute                   |

> **Dev mode:** If `PUBLIC_PLAUSIBLE_DOMAIN` is not set, the SDK runs with a **noop provider**. Auto-tracking still works locally (scroll, CWV, errors) but events are not sent to Plausible. Enable debug mode via `debug: import.meta.env.DEV` to see events in console.

---

## Important Rules

1. **Never call providers directly** — always use `track()` or helpers
2. **Never hardcode endpoint URLs or secrets**
3. **Every event must be registered in the registry** before use
4. **Every property must be registered in the property registry** before use
5. **Never send PII** — email, phone, address, password, token, etc.
6. **Use helpers** when available for type-safe tracking
7. **Add tests** when adding new events or properties
8. **For Astro components:** import from `../../analytics/astro-track.ts` (not `@spesialis/analytics` directly)
9. **For React components:** import from `@spesialis/analytics` directly
10. **Reference the integration tables above** to check if tracking already exists before adding new calls
