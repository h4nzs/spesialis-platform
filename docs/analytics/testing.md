# Testing

## Test Suite

The analytics package has **114 unit tests** across 11 test files covering:

| Area                     | Tests | File                  |
| ------------------------ | ----- | --------------------- |
| Configuration            | 8     | `config.test.ts`      |
| Session                  | 10    | `session.test.ts`     |
| Event Validation         | 12    | `validator.test.ts`   |
| Privacy Filter           | 16    | `privacy.test.ts`     |
| Sampling                 | 6     | `sampler.test.ts`     |
| Provider Layer           | 13    | `providers.test.ts`   |
| Dispatcher (Reliability) | 12    | `dispatcher.test.ts`  |
| Queue                    | 6     | `queue.test.ts`       |
| Tracker Pipeline         | 9     | `tracker.test.ts`     |
| Debug Store              | 8     | `debug-store.test.ts` |

## Running Tests

```bash
cd packages/analytics
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm typecheck      # TypeScript type checking
```

## Test Utilities

### Mock Provider

```ts
import { createMockProvider } from './__tests__/helpers/test-utils.ts';

const provider = createMockProvider({
  name: 'my-provider',
  trackShouldFail: true, // track() throws
  trackShouldTimeout: true, // track() never resolves
  initShouldFail: true, // init() rejects
  trackBatchSupported: true, // supports trackBatch()
  trackBatchShouldFail: true, // trackBatch() rejects
});
```

### Mock Event

```ts
import { createMockEvent, createMockDebugEvent } from './__tests__/helpers/test-utils.ts';

const event = createMockEvent({
  name: 'my_event',
  category: 'booking',
  properties: { service_id: 'srv-001' },
});

const debugEvent = createMockDebugEvent({
  validation: { valid: true },
  dispatchResults: { plausible: { success: true } },
});
```

### State Reset

```ts
import { resetConfig, registerTestProvider } from './__tests__/helpers/test-utils.ts';

beforeEach(() => {
  resetConfig(); // Reset config to defaults
});

test('my test', () => {
  registerTestProvider('test', {}); // Register a test provider
});
```

## Writing Tests

### Pattern

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getConfig, configureAnalytics } from '../core/config.ts';
import { resetConfig } from './helpers/test-utils.ts';

beforeEach(() => {
  resetConfig();
});

describe('Feature', () => {
  it('behaves correctly', () => {
    configureAnalytics({ debug: true });
    expect(getConfig().debug).toBe(true);
  });
});
```

### Testing with Browser APIs (tracker)

```ts
// Window mock is set up automatically via vi.hoisted in tracker.test.ts
// Tests that need track() use configureAnalytics({ batchSize: 0 }) for sync dispatch

test('dispatches to provider', () => {
  configureAnalytics({ batchSize: 0 });
  registerProvider('test', mockProvider, { enabled: true, options: {} });
  track('pageview', { url: '/', title: 'Test' });
  expect(tracked).toBe(true);
});
```

### Testing Async/Retry

```ts
test('retries on failure', async () => {
  vi.useFakeTimers();
  configureAnalytics({ maxRetries: 2, retryDelay: 50 });

  const promise = dispatchReliable(event);
  await vi.advanceTimersByTimeAsync(200);
  const results = await promise;
  // Assert results...
  vi.useRealTimers();
});
```

## CI Integration

Tests run automatically in CI via GitHub Actions:

```bash
pnpm typecheck  # TypeScript check
pnpm test       # Vitest
```
