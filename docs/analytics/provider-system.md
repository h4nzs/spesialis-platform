# Provider System

## Architecture

The provider layer abstracts all analytics providers behind a single interface. Components NEVER call providers directly — they use `track()` which routes through the dispatcher to active providers.

## Provider Interface

```ts
interface AnalyticsProvider {
  readonly name: string;
  init(config: Record<string, unknown>): void | Promise<void>;
  track(event: NormalizedEvent): void | Promise<void>;
  trackBatch?(events: NormalizedEvent[]): void | Promise<void>;
  pageview?(url: string, title: string): void | Promise<void>;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  destroy?(): void;
}
```

## Provider Registry

Providers are registered at bootstrap:

```ts
registerProvider('plausible', createPlausibleProvider(), {
  enabled: true,
  options: { domain: 'stats.ahlipanggilan.id', siteDomain: 'ahlipanggilan.id' },
  priority: 10, // lower = higher priority
});
```

### Key Functions

| Function                                   | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `registerProvider(name, provider, config)` | Add a provider                   |
| `unregisterProvider(name)`                 | Remove a provider                |
| `getActiveProviders()`                     | Get all enabled providers        |
| `getProvider(name)`                        | Get provider by name             |
| `getProviderConfig(name)`                  | Get provider's config            |
| `getProvidersByPriority()`                 | Get providers sorted by priority |
| `initProviders()`                          | Initialize all enabled providers |
| `destroyProviders()`                       | Destroy all and clear registry   |

## Built-in Providers

### Plausible Provider

Self-hosted Plausible Community Edition. Auto-injects the Plausible script, uses `window.plausible()` for custom events.

- Priority: 10 (highest)
- Requires: `domain` (your Plausible server), `siteDomain` (your website domain)
- Events: Automatic pageviews via script, custom events via `plausible()`

### Debug Provider

Logs every event to browser console with styled groups. Active when `debug: true`.

- Priority: 100
- No config needed
- Shows event ID, category, session, URL, properties with syntax highlighting

### Noop Provider

Silently swallows events. Auto-activated when no other provider is configured.

- Priority: 999
- No config needed

## Adding a New Provider

1. Create a factory function following the `AnalyticsProvider` interface
2. Register it at bootstrap with appropriate priority
3. No other code changes needed — components are provider-agnostic

```ts
export function createPostHogProvider(): AnalyticsProvider {
  return {
    name: 'posthog',
    init(config) {
      /* load PostHog script */
    },
    track(event) {
      /* posthog.capture(event.name, event.properties) */
    },
    destroy() {
      /* cleanup */
    },
  };
}
```

## Fallback Strategy

Providers are tried in priority order (lower = first). Two strategies:

- **failover** (default): Try high-priority first. If it fails after all retries, try the next.
- **parallel**: Dispatch to all providers concurrently.

Configure via:

```ts
configureAnalytics({ fallbackStrategy: 'parallel' });
```
