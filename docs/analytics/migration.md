# Migration Guide

## From Google Analytics

### Step 1: Install Analytics Package

```bash
pnpm add @spesialis/analytics
```

### Step 2: Bootstrap

Replace GA initialization with analyticsInit():

```ts
// Before (GA)
gtag('config', 'G-XXXXXXXXXX');

// After
import { analyticsInit } from '@spesialis/analytics';

analyticsInit({
  providers: {
    plausible: {
      enabled: true,
      options: {
        domain: 'stats.ahlipanggilan.id',
        siteDomain: 'ahlipanggilan.id',
      },
    },
  },
});
```

### Step 3: Migrate Events

```ts
// Before (GA)
gtag('event', 'booking_submit', { service_id: 'srv-001' });

// After
track('booking_submit', { service_id: 'srv-001', booking_id: 'bk-001', customer_type: 'guest' });
```

### Step 4: Remove GA Script

Remove the Google Analytics script tag and gtag snippet from your HTML.

## From Manual Plausible Setup

### Step 1: Install Package

```bash
pnpm add @spesialis/analytics
```

### Step 2: Replace Plausible Script

```ts
// Before: Manual Plausible script in HTML
<script defer data-domain="example.com" src="https://stats.example.com/js/script.js"></script>

// After: Provider handles script injection
analyticsInit({
  providers: {
    plausible: {
      enabled: true,
      options: { domain: 'stats.ahlipanggilan.id', siteDomain: 'ahlipanggilan.id' },
    },
  },
})
```

### Step 3: Replace Plausible Events

```ts
// Before
window.plausible('Booking', { props: { service_id: 'srv-001' } });

// After
track('booking_submit', { service_id: 'srv-001', booking_id: 'bk-001', customer_type: 'guest' });
```

## Deprecating an Event

### Release N

```ts
// Set status to 'deprecated'
ev({
  name: 'old_event',
  status: 'deprecated',
  changelog: 'Deprecated in v2.0. Use new_event instead.',
  // ...
});
```

### Release N+1

```ts
// Set status to 'removed'
ev({
  name: 'old_event',
  status: 'removed',
  // ...
});
```

### Release N+2

```ts
// Remove entirely from EventRegistry, events/index.ts, and tests
```

## Adding a New Provider

1. Create provider factory in `src/providers/index.ts`
2. Implement `AnalyticsProvider` interface
3. Register at bootstrap
4. Add to `analyticsInit()` if it should be auto-registerable
5. Add tests
