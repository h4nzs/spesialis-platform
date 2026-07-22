# Analytics Platform — Architecture

## Overview

The analytics platform (`@spesialis/analytics`) is a provider-agnostic, type-safe analytics system built for the Ahli Panggilan platform. It's designed to be the single analytics infrastructure for the next 5+ years, supporting multiple providers, hundreds of events, and enterprise-scale requirements.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │ Helpers │ │ Hooks    │ │ Client  │ │ Debug Panel     │  │
│  └────┬────┘ └────┬─────┘ └────┬────┘ └────────┬────────┘  │
│       │           │            │               │           │
├───────┴───────────┴────────────┴───────────────┴───────────┤
│                      Analytics Core                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────┐  │
│  │ track()  │ │ Validate │ │ Privacy │ │   Sampling    │  │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └──────┬────────┘  │
│       │            │            │              │           │
│       └────────────┴────────────┴──────────────┘           │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────┐          │
│  │                 Queue + Dispatcher              │          │
│  │  ┌───────────┐  ┌────────────┐  ┌──────────┐  │          │
│  │  │  Batching │  │   Retry    │  │ Fallback │  │          │
│  │  └───────────┘  └────────────┘  └──────────┘  │          │
│  └───────────────────────┬───────────────────────┘          │
├──────────────────────────┴──────────────────────────────────┤
│                     Provider Layer                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  Plausible │  │   Debug   │  │   Noop    │  ...          │
│  └───────────┘  └───────────┘  └───────────┘               │
├─────────────────────────────────────────────────────────────┤
│                      Registry Layer                          │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Event Registry│  │ Property Registry│  │ Goal/Funnel  │  │
│  └──────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Registry Layer

- **Event Registry**: Single source of truth for all event definitions. 60+ registered events.
- **Property Registry**: All allowed properties with privacy levels. 70+ registered properties.
- **Goal Registry**: Business goals mapped to KPIs. 6 default goals.
- **Funnel Registry**: Business funnels for conversion analysis. 4 default funnels.

### 2. Core Layer

- **track()**: Single entry point for ALL tracking. Pipeline: validate → privacy → sample → queue → dispatch.
- **Validator**: Compile-time + runtime validation against registries.
- **Privacy Filter**: 3-layer PII protection (registry, patterns, depth limit).
- **Sampling**: Deterministic hash-based sampling per session+event.
- **Session Manager**: Browser-tab-scoped session with user identity tracking.

### 3. Queue & Dispatcher

- **Batching Queue**: `requestIdleCallback` with `setTimeout` fallback.
- **Retry Queue**: Background retries with exponential backoff.
- **Reliable Dispatch**: Retry + timeout + fallback chain.
- **Error Isolation**: One provider failure never blocks others.

### 4. Provider Layer

- **Provider Interface**: Abstract `AnalyticsProvider` with `track()`, `init()`, `trackBatch()`, `destroy()`.
- **Built-in Providers**: Plausible (self-hosted), Debug (console), Noop (fallback).
- **Provider Agnostic**: Swap providers via config — no code changes needed.

### 5. Application Layer

- **Helpers**: Domain-specific functions (trackBooking, trackPayment, etc.).
- **React Hook**: `useAnalytics()` for easy component integration.
- **Auto-Tracking**: Pageview, scroll depth, engagement, outbound links, downloads, CWV, errors.
- **Debug Panel**: Floating DevTools panel with event inspector, provider health, retry queue status.

## Key Design Decisions

### Provider Agnostic

All components use `track()` — they never know which provider is active. Swap providers via config at bootstrap.

### Type Safety

TypeScript `EventRegistry` interface maps event names to their required/optional properties. `track()` is fully typed — invalid events or properties are compile-time errors.

### Privacy by Design

Three-layer PII filter: (1) registry privacy levels, (2) 25+ PII patterns, (3) depth limit + circular reference guard. No PII ever reaches providers.

### Reliability

- Sync dispatch: error isolation, retry queue
- Async dispatch: retry (3x, exponential backoff), timeout (5s), fallback chain
- Offline queue: sessionStorage persistence, auto-flush on reconnect

### Tree-Shakable

Production builds exclude debug panel, debug provider, and debug event history when `debug: false`.

## File Structure

```
packages/analytics/src/
├── index.ts              # Public API + analyticsInit() bootstrap
├── types.ts              # Core type definitions
├── core/
│   ├── config.ts         # Configuration store
│   ├── tracker.ts        # track() + trackImmediate()
│   ├── validator.ts      # Event validation
│   ├── privacy.ts        # PII filter
│   ├── sampler.ts        # Determinisitc sampling
│   ├── session.ts        # Session manager
│   ├── queue.ts          # Batching queue + offline persistence
│   ├── dispatcher.ts     # Sync/async dispatch + retry + fallback
│   └── debug.ts          # Debug event history + subscriptions
├── providers/
│   └── index.ts          # Provider registry + built-in providers
├── registry/
│   ├── events.ts         # Event definitions store
│   ├── properties.ts     # Property definitions store
│   ├── goals.ts          # Goal definitions
│   └── funnels.ts        # Funnel definitions
├── events/
│   └── index.ts          # All event definitions (side-effect registration)
├── properties/
│   └── index.ts          # All property definitions (side-effect registration)
├── helpers/
│   └── index.ts          # Domain-specific track helpers
├── hooks/
│   └── useAnalytics.ts   # React hook
├── client/
│   └── index.ts          # Auto-tracking (pageview, scroll, CWV, etc.)
└── debug/
    ├── index.ts          # Debug panel API + auto-render
    ├── panel.tsx         # React floating DevTools panel
    └── store.ts          # Reactive debug store
```
