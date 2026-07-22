# Analytics Core

## Entry Point: `track()`

The `track()` function is the **single entry point** for all analytics events. Every component, hook, and helper ultimately calls `track()`.

```ts
track('booking_submit', {
  service_id: 'SP-SRV-001',
  booking_id: 'SP-2026-000001',
  customer_type: 'guest',
});
```

### Pipeline

Every `track()` call flows through this pipeline:

```
1. SSR Guard       → Skip if window undefined (SSR)
2. Event ID Gen    → timestamp-random unique ID
3. Duplicate Check → Reject if same ID within 5s window
4. Validation      → Check event & properties against registry
5. Privacy Filter  → Remove PII/sensitive/internal properties
6. Sampling        → Skip if sampled out (deterministic hash)
7. Session         → Get/create session + user identity
8. Build Event     → Construct NormalizedEvent
9. Queue/Dispath   → Enqueue for batched dispatch (or immediate)
10. Debug          → Add debug event if debug mode enabled
```

### Configuration

Configure at app startup:

```ts
configureAnalytics({
  debug: import.meta.env.DEV,
  defaultSamplingRate: 1, // 1 = send all events
  batchInterval: 2000, // 2s max queue delay
  batchSize: 10, // flush after 10 events
  maxRetries: 3, // retry failed dispatches
  retryDelay: 1000, // 1s base delay (exponential)
  dispatchTimeout: 5000, // 5s per-dispatch timeout
  fallbackStrategy: 'failover', // try providers in priority order
});
```

### Immediate Dispatch

For critical events (payment confirmation, etc.):

```ts
trackImmediate('payment_success', {
  booking_id: 'SP-2026-000001',
  amount: 150000,
  method: 'transfer',
  payment_id: 'PAY-001',
});
```

This calls `track()` then immediately flushes the queue.

### Bootstrap

Use `analyticsInit()` for one-call setup:

```ts
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
  autoTracking: {
    pageview: true,
    scroll: true,
    engagement: true,
    errors: true,
  },
});
```

This configures, registers providers, loads registries, and starts auto-tracking.
