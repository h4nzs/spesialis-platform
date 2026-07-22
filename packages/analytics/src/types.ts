// =============================================================================
// Analytics Platform — Core Types
// =============================================================================
// Single source of truth for all analytics type definitions.
// Every event, property, provider, and configuration type lives here.
// =============================================================================

// ── Event Category ────────────────────────────────────────────────
// Literal union — compile-time safe, no magic strings allowed
export type EventCategory =
  | 'navigation'
  | 'landing'
  | 'search'
  | 'service'
  | 'booking'
  | 'payment'
  | 'authentication'
  | 'partner'
  | 'corporate'
  | 'cms'
  | 'seo'
  | 'dashboard'
  | 'admin'
  | 'customer'
  | 'dispatcher'
  | 'finance'
  | 'review'
  | 'complaint'
  | 'notification'
  | 'error'
  | 'system'
  | 'performance'
  | 'engagement'
  | 'experiment';

// ── Privacy Level ─────────────────────────────────────────────────
export type PrivacyLevel = 'public' | 'internal' | 'sensitive' | 'pii';

// ── Property Type ─────────────────────────────────────────────────
export type PropertyType = 'string' | 'number' | 'boolean' | 'timestamp' | 'array' | 'record';

// ── Event Status ──────────────────────────────────────────────────
export type EventStatus = 'active' | 'deprecated' | 'removed';

// ── Property Definition — Registry Entry ──────────────────────────
export interface PropertyDefinition<T extends PropertyType = PropertyType, V = unknown> {
  /** Unique property key (snake_case) */
  key: string;

  /** Human-readable description */
  description: string;

  /** TypeScript type */
  type: T;

  /** Valid values (if enum) */
  allowedValues?: readonly V[];

  /** Privacy classification */
  privacy: PrivacyLevel;

  /** Whether this property is required always */
  required?: boolean;

  /** If true, never send to any provider */
  internal?: boolean;

  /** Version for tracking schema changes */
  version: number;

  /** Owner team/domain */
  owner: string;

  /** Deprecation info */
  deprecated?: {
    since: string;
    替代: string;
  };
}

// ── Event Definition — Registry Entry ─────────────────────────────
export interface EventDefinition<
  T extends EventCategory = EventCategory,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Unique event name (snake_case) */
  name: string;

  /** Event category */
  category: T;

  /** Human-readable description */
  description: string;

  /** Business objective this event supports */
  businessObjective: string;

  /** KPI this event maps to */
  kpi?: string;

  /** Owner team/domain */
  owner: string;

  /** Allowed properties for this event */
  properties: {
    required: readonly (keyof P & string)[];
    optional: readonly (keyof P & string)[];
  };

  /** Goal mapping — which goal(s) this event contributes to */
  goals?: readonly string[];

  /** Funnel mapping */
  funnel?: string;

  /** Event lifecycle status */
  status: EventStatus;

  /** Schema version */
  version: number;

  /** Human-readable changelog */
  changelog?: string;
}

// ── Normalized Event — What Flows Through the Pipeline ────────────
export interface NormalizedEvent<
  T extends string = string,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Unique event ID (for deduplication) */
  id: string;

  /** Event name */
  name: T;

  /** Event category */
  category: EventCategory;

  /** ISO timestamp */
  timestamp: string;

  /** Sanitized properties (PII removed) */
  properties: P;

  /** Session identifier */
  sessionId: string;

  /** Page URL */
  pageUrl: string;

  /** Page referrer */
  referrer?: string;

  /** User identifier (anonymous or authenticated) */
  userId?: string;

  /** Sampling decision */
  sampled: boolean;
}

// ── Provider Interface ────────────────────────────────────────────
export interface AnalyticsProvider {
  /** Unique provider name */
  readonly name: string;

  /** Initialize provider */
  init(config: Record<string, unknown>): void | Promise<void>;

  /** Track a single normalized event */
  track(event: NormalizedEvent): void | Promise<void>;

  /** Track batch of events (for batching providers) */
  trackBatch?(events: NormalizedEvent[]): void | Promise<void>;

  /** Manual pageview tracking (if not automatic) */
  pageview?(url: string, title: string): void | Promise<void>;

  /** Set user identity */
  identify?(userId: string, traits?: Record<string, unknown>): void;

  /** Cleanup */
  destroy?(): void;
}

// ── Provider Configuration ────────────────────────────────────────
export interface ProviderConfig {
  /** Whether this provider is active */
  enabled: boolean;

  /** Provider-specific options */
  options: Record<string, unknown>;

  /** Sampling rate (0-1) */
  samplingRate?: number;

  /** Environment filter */
  environments?: ('development' | 'staging' | 'production')[];

  /** Priority for dispatch ordering (lower = tried first). Used for fallback chains. */
  priority?: number;

  /** Fallback provider names to try if this provider fails after all retries */
  fallbackProviders?: string[];
}

// ── Analytics Configuration ───────────────────────────────────────
export interface AnalyticsConfig {
  /** Provider configurations keyed by provider name */
  providers: Record<string, ProviderConfig>;

  /** Debug mode */
  debug: boolean;

  /** Default sampling rate */
  defaultSamplingRate: number;

  /** Batch interval in ms */
  batchInterval: number;

  /** Max queue size before flush */
  batchSize: number;

  /** Max retry attempts per provider dispatch */
  maxRetries: number;

  /** Base retry delay in ms (exponential backoff: delay * 2^attempt) */
  retryDelay: number;

  /** Per-dispatch timeout in ms */
  dispatchTimeout: number;

  /** How to handle multiple providers: failover (priority order) or parallel */
  fallbackStrategy: 'failover' | 'parallel';

  /** Enable automatic tracking (pageview, scroll, etc.) */
  autoTracking: {
    pageview: boolean;
    scroll: boolean;
    engagement: boolean;
    outboundLinks: boolean;
    downloads: boolean;
    errors: boolean;
    performance: boolean;
    visibility: boolean;
    historyNavigation: boolean;
  };
}

// ── Goal Definition ───────────────────────────────────────────────
export interface GoalDefinition {
  /** Unique goal name */
  name: string;

  /** Human-readable description */
  description: string;

  /** Business KPI this goal supports */
  kpi: string;

  /** Events that count toward this goal */
  events: readonly string[];

  /** Conversion type */
  type: 'pageview' | 'event' | 'duration' | 'custom';

  /** Target value */
  target?: number;
}

// ── Funnel Step ───────────────────────────────────────────────────
export interface FunnelStep {
  /** Step order (1-based) */
  order: number;

  /** Step name */
  name: string;

  /** Event that triggers this step */
  event: string;

  /** Optional — time limit to complete this step (ms) */
  timeLimit?: number;

  /** Whether this step is optional */
  optional?: boolean;
}

// ── Funnel Definition ─────────────────────────────────────────────
export interface FunnelDefinition {
  /** Unique funnel name */
  name: string;

  /** Human-readable description */
  description: string;

  /** Business KPI this funnel supports */
  kpi: string;

  /** Steps in order */
  steps: readonly FunnelStep[];

  /** Time window to complete the funnel (ms) */
  window: number;
}

// ── Track Options ─────────────────────────────────────────────────
export interface TrackOptions {
  /** Override sampling rate for this event */
  samplingRate?: number;

  /** Override queue behavior */
  immediate?: boolean;

  /** Provider filter (only send to these providers) */
  providers?: string[];
}

// ── Debug Event ───────────────────────────────────────────────────
export interface DebugEvent extends NormalizedEvent {
  /** Dispatch results per provider */
  dispatchResults: Record<string, { success: boolean; error?: string }>;

  /** Validation results */
  validation: { valid: boolean; errors?: string[] };

  /** Timing */
  duration: number;

  /** Queue status */
  queued: boolean;

  /** Privacy filter applied */
  filtered: boolean;
}

// ── Global Window Extension ───────────────────────────────────────
export interface AnalyticsWindow extends Window {
  plausible?: {
    q: unknown[];
    (event: string, options?: { props?: Record<string, unknown>; callback?: () => void }): void;
  };
  dataLayer?: unknown[];
  // future provider globals
  posthog?: unknown;
  mixpanel?: unknown;
  gtag?: (...args: unknown[]) => void;
}
