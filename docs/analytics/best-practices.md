# Best Practices

## Tracking

### Use Helpers When Available

```ts
// ✅ Good — type-safe, consistent
trackBookingSubmit('srv-001', 'bk-001', 'guest');

// ❌ Avoid — manual tracking, error-prone
track('booking_submit', { service_id: 'srv-001', booking_id: 'bk-001', customer_type: 'guest' });
```

### Track Actions, Not Page Views

Page views are auto-tracked. Track user actions:

```ts
// ✅ Track what users DO
track('cta_click', { section: 'hero', cta: 'Pesan', position: 1, page: '/' });

// ❌ Don't manually track page views
track('pageview', { url: '/', title: 'Home' });
```

### Be Specific with Properties

```ts
// ✅ Good — specific, actionable
track('booking_cancel', { booking_id: 'bk-001', reason: 'change_of_mind' });

// ❌ Avoid — too vague, not actionable
track('booking_cancel', {});
```

### Track Business Outcomes, Not Implementation Details

```ts
// ✅ Good — business outcome
track('payment_success', {
  booking_id: 'bk-001',
  amount: 150000,
  method: 'transfer',
  payment_id: 'pay-001',
});

// ❌ Avoid — implementation detail
track('api_response_200', { endpoint: '/api/v1/payments', duration: 250 });
```

## Event Design

### One Event, One Meaning

Don't overload events with multiple meanings. Create separate events:

```ts
// ✅ Two clear events
track('booking_start', { service_id: 'srv-001', customer_type: 'guest' });
track('booking_submit', { service_id: 'srv-001', booking_id: 'bk-001', customer_type: 'guest' });

// ❌ Avoid — unclear what 'booking_event' means
track('booking_event', { action: 'start', service_id: 'srv-001' });
```

### Include Context

Every event should be understandable in isolation:

```ts
// ✅ Good — self-explanatory
track('article_view', { article_id: 'art-001', category: 'tips', slug: 'tips-perawatan-ac' });

// ❌ Avoid — missing context
track('article_view', { article_id: 'art-001' });
```

## Privacy

### Never Send PII

The privacy filter blocks known PII, but double-check:

```ts
// ❌ Will be filtered out
track('register_complete', {
  user_id: 'usr-001',
  role: 'customer',
  email: 'user@example.com',
  phone: '08123456789',
});

// ✅ Email replaced with hash, phone removed
track('register_complete', { user_id: 'usr-001', role: 'customer', email_hash: 'abc123...' });
```

### Use email_hash, Not email

```ts
// ✅ Safe — SHA-256 hash
track('password_reset_request', { email_hash: 'a1b2c3...' });
```

## Performance

### Avoid Tracking on Every Interaction

```ts
// ❌ Avoid — tracks every keystroke
input.addEventListener('input', (e) => track('search_typing', { query: e.target.value }));

// ✅ Better — debounce or track on submit
form.addEventListener('submit', () =>
  track('search_performed', { query: input.value, result_count: results.length }),
);
```

### Use Immediate Dispatch for Conversions

```ts
// ✅ Critical events bypass the queue
await trackImmediate('payment_success', {
  booking_id: 'bk-001',
  amount: 150000,
  method: 'transfer',
  payment_id: 'pay-001',
});
```

## Debugging

### Enable Debug Mode in Development

```ts
analyticsInit({
  providers: { ... },
  debug: import.meta.env.DEV,  // Auto-enables debug provider
})
```

### Use the Debug Panel

Press **Ctrl+Shift+A** to toggle the floating debug panel. Check:

- Events tab: Are events being fired with correct properties?
- Providers tab: Are providers healthy?
- Retry tab: Are there failed dispatches?
- Config tab: Is the configuration correct?

### Console API

```ts
// Access analytics state from browser console
window.__SPESIALIS_ANALYTICS_DEBUG__.snapshot; // Current state
window.__SPESIALIS_ANALYTICS_DEBUG__.export(); // Export events as JSON
window.__SPESIALIS_ANALYTICS_DEBUG__.clear(); // Clear event history
```
