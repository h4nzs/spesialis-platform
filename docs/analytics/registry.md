# Registry System

## Overview

The analytics platform has two core registries that serve as the single source of truth for all tracking data. Every event and every property must be registered before use. Unregistered events/properties are rejected at runtime.

## Event Registry

### Interface

```ts
interface EventDefinition {
  name: string;
  category: EventCategory;
  description: string;
  businessObjective: string;
  kpi?: string;
  owner: string;
  properties: { required: string[]; optional: string[] };
  goals?: string[];
  funnel?: string;
  status: 'active' | 'deprecated' | 'removed';
  version: number;
  changelog?: string;
}
```

### EventRegistry Type

The `EventRegistry` TypeScript interface provides compile-time safety:

```ts
interface EventRegistry {
  pageview: { url: string; title: string; referrer?: string };
  booking_submit: { service_id: string; booking_id: string; customer_type: 'guest' | 'registered' };
  payment_success: { booking_id: string; amount: number; method: string; payment_id: string };
  // ... 60+ events
}
```

This means `track('booking_submit', { ... })` is fully typed. Missing required properties or extra unknown properties are compile-time errors.

### Registration

Events are defined in `src/events/index.ts` using the `ev()` helper:

```ts
ev({
  name: 'booking_submit',
  category: 'booking',
  version: 1,
  description: 'User submits a completed booking form',
  businessObjective: 'Track successful booking submissions',
  kpi: 'Booking Conversion Rate > 15%',
  owner: 'booking',
  properties: { required: ['service_id', 'booking_id', 'customer_type'], optional: [] },
  goals: ['booking_completed'],
  funnel: 'booking',
  status: 'active',
});
```

### API

| Function                        | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `getEventDefinition(name)`      | Get event metadata                           |
| `getAllEventDefinitions()`      | List all registered events                   |
| `getEventsByCategory(category)` | Filter by category                           |
| `getEventsByStatus(status)`     | Filter by status (active/deprecated/removed) |
| `registerEventDefinition(def)`  | Register a new event                         |

## Property Registry

### Interface

```ts
interface PropertyDefinition {
  key: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'timestamp' | 'array' | 'record';
  allowedValues?: readonly unknown[];
  privacy: 'public' | 'internal' | 'sensitive' | 'pii';
  required?: boolean;
  internal?: boolean;
  version: number;
  owner: string;
}
```

### Privacy Levels

| Level       | Description                       | Example                         |
| ----------- | --------------------------------- | ------------------------------- |
| `public`    | Safe to send to any provider      | `service_id`, `url`, `category` |
| `internal`  | Used internally, never sent       | `price`, `payment_id`           |
| `sensitive` | Business sensitive, filtered      | `amount`, `user_id`             |
| `pii`       | Personally identifiable, filtered | `email`, `phone`, `name`        |

### Registration

Properties are defined in `src/properties/index.ts`:

```ts
prop({
  key: 'booking_id',
  type: 'string',
  description: 'Unique booking identifier',
  privacy: 'public',
  owner: 'booking',
  version: 1,
});
prop({
  key: 'amount',
  type: 'number',
  description: 'Payment amount in IDR',
  privacy: 'sensitive',
  owner: 'finance',
  version: 1,
});
```

### API

| Function                        | Purpose                         |
| ------------------------------- | ------------------------------- |
| `getPropertyDefinition(key)`    | Get property metadata           |
| `getAllPropertyDefinitions()`   | List all registered properties  |
| `getPropertiesByPrivacy(level)` | Filter by privacy level         |
| `getPublicProperties()`         | Get only public-safe properties |

## Adding New Events/Properties

1. Add the event name + properties to `EventRegistry` interface in `src/registry/events.ts`
2. Add event definition in `src/events/index.ts`
3. Add any new properties in `src/properties/index.ts`
4. Add tests in `src/__tests__/validator.test.ts`

## Governance Rules

- Every event MUST have a `businessObjective`
- Every event MUST have an `owner` team
- Properties with `privacy: 'pii'` are NEVER sent to any provider
- Properties with `privacy: 'sensitive'` are filtered by default
- Properties with `internal: true` are NEVER sent to any provider
- Deprecated events get `status: 'deprecated'` before removal
- Removed events (`status: 'removed'`) are rejected at runtime
