# Performance

## Design Goals

- Analytics must NOT block rendering, hydration, or navigation
- Zero layout shift from analytics scripts
- Minimal bundle impact

## Techniques

### 1. Batched Dispatch

Events are queued and dispatched in batches:

- **Batch size**: 10 events (configurable)
- **Batch interval**: 2000ms (configurable)
- **Flush mechanism**: `requestIdleCallback` with `setTimeout` fallback

This ensures analytics never competes with critical rendering work.

### 2. Non-Blocking Loading

All provider scripts are loaded with `defer` and `async`:

```html
<script src="https://stats.example.com/js/script.js" defer async></script>
```

### 3. Tree Shaking

Production builds automatically exclude:

- Debug panel (React component + store)
- Debug provider (console logging)
- Debug event history (500-entry buffer)
- All `console.warn` calls in production

When `debug: false`, these modules are tree-shaken by the bundler.

### 4. Sampling

Deterministic sampling reduces event volume:

- Rate `1.0` = send all events (default for production)
- Rate `0.5` = send ~50% of events
- Rate `0.0` = send no events (testing/development)

Sampling is deterministic per session + event name, preserving funnel accuracy.

### 5. Bundle Size

The analytics core (without debug panel):

| Module               | Est. Size (gzipped) |
| -------------------- | ------------------- |
| Core types + config  | ~1KB                |
| Tracker + pipeline   | ~3KB                |
| Validator            | ~1KB                |
| Privacy filter       | ~2KB                |
| Sampler + session    | ~1KB                |
| Queue + dispatcher   | ~4KB                |
| Providers            | ~2KB                |
| Registry             | ~2KB                |
| Event definitions    | ~5KB                |
| Property definitions | ~4KB                |
| **Total core**       | **~25KB**           |

Debug panel adds approximately ~15KB (React component).

### 6. Memory Management

- Debug event history: capped at 500 events
- Duplicate detection window: 5-second timeout, auto-cleanup
- Queue: empties on flush, no accumulation
- Session: single object, browser-tab lifetime
- Providers: singleton instances, no per-event allocations

### 7. Automatic Tracking Performance

| Feature            | Overhead   | Mechanism                       |
| ------------------ | ---------- | ------------------------------- |
| Pageview           | Negligible | Single track() call             |
| Scroll depth       | Low        | Throttled scroll listener       |
| Engagement         | Low        | 30s interval                    |
| Outbound links     | Low        | Event delegation                |
| Downloads          | Low        | Click handler + extension check |
| Errors             | None       | Passive event listeners         |
| CWV (LCP/CLS/FID)  | Low        | PerformanceObserver             |
| History navigation | Low        | pushState monkey-patch          |

### 8. Offline Resilience

- Events queued during offline are persisted to sessionStorage
- Auto-flushed when connection restores (`online` event)
- No impact on online performance

### Best Practices

1. **Set `batchSize: 0` only for critical events** — use `trackImmediate()` instead
2. **Use sampling for high-volume events** — scroll, engagement, performance metrics
3. **Keep property payloads small** — avoid large objects or nested data
4. **Test with production bundle** — verify tree-shaking works
