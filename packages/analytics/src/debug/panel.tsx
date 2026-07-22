// =============================================================================
// Analytics Platform — Debug Panel (React Component)
// =============================================================================
// Floating DevTools-style panel for inspecting analytics in real-time.
// Features:
// - Event stream (live, filterable, searchable)
// - Event detail view with payload, validation, dispatch results
// - Provider health overview
// - Retry queue status monitor
// - Config viewer
// - Export/clear actions
// - Keyboard shortcut: Ctrl+Shift+A / Cmd+Shift+A
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import type { DebugEvent } from '../types.ts';
import type { DebugStoreSnapshot } from './store.ts';
import { subscribeToStore, clearAllEvents, exportEvents } from './store.ts';

// ── Styles ─────────────────────────────────────────────────────────
// Inlined for zero-dependency distribution (no CSS modules needed).
const PANEL_STYLES = {
  container: {
    position: 'fixed' as const,
    bottom: 0,
    right: 0,
    width: '600px',
    maxWidth: '100vw',
    height: '400px',
    maxHeight: '50vh',
    backgroundColor: '#1e1e2e',
    color: '#cdd6f4',
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontSize: '12px',
    lineHeight: '1.5',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column' as const,
    borderTopLeftRadius: '8px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(205,214,244,0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#181825',
    borderBottom: '1px solid #313244',
    cursor: 'pointer',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#cba6f7',
    letterSpacing: '0.5px',
  },
  badge: {
    display: 'inlineFlex',
    alignItems: 'center',
    padding: '1px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '8px',
  },
  badgeError: {
    backgroundColor: 'rgba(243,139,168,0.2)',
    color: '#f38ba8',
  },
  badgeInfo: {
    backgroundColor: 'rgba(137,180,250,0.2)',
    color: '#89b4fa',
  },
  badgeRetry: {
    backgroundColor: 'rgba(249,226,175,0.2)',
    color: '#f9e2af',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#181825',
    borderBottom: '1px solid #313244',
    padding: '0 8px',
  },
  tab: {
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    color: '#6c7086',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    color: '#cdd6f4',
    borderBottomColor: '#cba6f7',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '4px 0',
  },
  footer: {
    display: 'flex',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#181825',
    borderTop: '1px solid #313244',
    fontSize: '10px',
    color: '#585b70',
  },
  button: {
    padding: '3px 8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  eventRow: {
    padding: '4px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(49,50,68,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.1s ease',
  },
  eventName: {
    color: '#89b4fa',
    fontWeight: 500,
  },
  eventCategory: {
    color: '#a6e3a1',
    fontSize: '10px',
  },
  eventTime: {
    color: '#585b70',
    fontSize: '10px',
    marginLeft: 'auto',
  },
  propertyKey: {
    color: '#fab387',
  },
  propertyValue: {
    color: '#a6e3a1',
  },
  detailPanel: {
    borderTop: '1px solid #313244',
    backgroundColor: '#11111b',
    maxHeight: '200px',
    overflow: 'auto',
    padding: '8px 12px',
  },
  providerDot: (healthy: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: healthy ? '#a6e3a1' : '#f38ba8',
    display: 'inlineBlock',
    marginRight: '6px',
    flexShrink: 0,
  }),
  searchInput: {
    backgroundColor: '#313244',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#cdd6f4',
    fontSize: '11px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  },
  minimap: {
    position: 'absolute' as const,
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '6px',
    height: '60%',
    backgroundColor: '#313244',
    borderRadius: '3px',
    opacity: 0.3,
  },
  keyValue: (_keyParam: string) => ({
    display: 'flex',
    gap: '8px',
    padding: '1px 0',
  }),
} as const;

// ── Tab Definitions ───────────────────────────────────────────────

type TabID = 'events' | 'providers' | 'retry' | 'config';

const TABS: { id: TabID; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'providers', label: 'Providers' },
  { id: 'retry', label: 'Retry' },
  { id: 'config', label: 'Config' },
];

// ── Event Category Colors ─────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  navigation: '#89b4fa',
  landing: '#a6e3a1',
  search: '#f9e2af',
  service: '#fab387',
  booking: '#f38ba8',
  payment: '#cba6f7',
  authentication: '#94e2d5',
  partner: '#f5c2e7',
  corporate: '#89dceb',
  cms: '#a6e3a1',
  seo: '#f9e2af',
  dashboard: '#74c7ec',
  admin: '#f38ba8',
  customer: '#a6e3a1',
  dispatcher: '#fab387',
  finance: '#f9e2af',
  review: '#cba6f7',
  complaint: '#f38ba8',
  notification: '#89dceb',
  error: '#f38ba8',
  system: '#6c7086',
  performance: '#a6e3a1',
  engagement: '#89b4fa',
  experiment: '#f5c2e7',
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6c7086';
}

// ── Tab Components ────────────────────────────────────────────────

interface EventsTabProps {
  events: readonly DebugEvent[];
  selectedEvent: DebugEvent | null;
  onSelectEvent: (event: DebugEvent | null) => void;
}

function EventsTab({ events, selectedEvent, onSelectEvent }: EventsTabProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const e of events) cats.add(e.category);
    return Array.from(cats).sort();
  }, [events]);

  const filtered = useMemo(() => {
    if (!search && !filterCategory) return events;
    return events.filter((e) => {
      if (filterCategory && e.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          JSON.stringify(e.properties).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, search, filterCategory]);

  return (
    <div>
      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...PANEL_STYLES.searchInput, width: 'auto', flex: 1 }}
        />
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          style={{
            backgroundColor: '#313244',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            color: '#cdd6f4',
            fontSize: '10px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Event List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#585b70' }}>
          {search || filterCategory ? 'No matching events' : 'Awaiting events...'}
        </div>
      ) : (
        filtered.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event.id === selectedEvent?.id ? null : event)}
            style={{
              ...PANEL_STYLES.eventRow,
              backgroundColor:
                event.id === selectedEvent?.id ? 'rgba(137,180,250,0.08)' : undefined,
            }}
          >
            {/* Status dot */}
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: event.validation.valid
                  ? Object.values(event.dispatchResults).some((r) => !r.success)
                    ? '#f9e2af'
                    : '#a6e3a1'
                  : '#f38ba8',
                flexShrink: 0,
              }}
            />

            {/* Category tag */}
            <span
              style={{
                backgroundColor: `${getCategoryColor(event.category)}22`,
                color: getCategoryColor(event.category),
                padding: '0 4px',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: 600,
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {event.category}
            </span>

            {/* Event name */}
            <span style={PANEL_STYLES.eventName}>{event.name}</span>

            {/* Duration */}
            <span style={{ color: '#585b70', fontSize: '10px' }}>
              {event.duration.toFixed(0)}ms
            </span>

            {/* Timestamp */}
            <span style={PANEL_STYLES.eventTime}>
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))
      )}

      {/* Detail Panel */}
      {selectedEvent && (
        <div style={PANEL_STYLES.detailPanel}>
          <EventDetail event={selectedEvent} />
        </div>
      )}
    </div>
  );
}

// ── Event Detail ──────────────────────────────────────────────────

function EventDetail({ event }: { event: DebugEvent }) {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: '#585b70' }}>ID: </span>
          <span style={{ color: '#cdd6f4', fontSize: '10px' }}>{event.id}</span>
        </div>
        <div>
          <span style={{ color: '#585b70' }}>Session: </span>
          <span style={{ color: '#cdd6f4', fontSize: '10px' }}>
            {event.sessionId.slice(0, 12)}...
          </span>
        </div>
        <div>
          <span style={{ color: '#585b70' }}>Filtered: </span>
          <span style={{ color: event.filtered ? '#a6e3a1' : '#6c7086' }}>
            {String(event.filtered)}
          </span>
        </div>
        <div>
          <span style={{ color: '#585b70' }}>Queued: </span>
          <span style={{ color: event.queued ? '#a6e3a1' : '#f9e2af' }}>
            {String(event.queued)}
          </span>
        </div>
      </div>

      {/* Validation */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: '#585b70' }}>Validation: </span>
        <span style={{ color: event.validation.valid ? '#a6e3a1' : '#f38ba8', fontWeight: 600 }}>
          {event.validation.valid ? 'PASS' : 'FAIL'}
        </span>
        {event.validation.errors && event.validation.errors.length > 0 && (
          <div
            style={{ color: '#f38ba8', fontSize: '11px', marginTop: '2px', paddingLeft: '12px' }}
          >
            {event.validation.errors.map((err, i) => (
              <div key={i}>⚠ {err}</div>
            ))}
          </div>
        )}
      </div>

      {/* Properties */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: '#585b70' }}>Properties:</span>
        <div style={{ paddingLeft: '12px', marginTop: '2px' }}>
          {Object.entries(event.properties).length === 0 ? (
            <span style={{ color: '#585b70', fontStyle: 'italic' }}>none</span>
          ) : (
            Object.entries(event.properties).map(([key, value]) => (
              <div key={key} style={PANEL_STYLES.keyValue(key)}>
                <span style={PANEL_STYLES.propertyKey}>{key}:</span>
                <span style={PANEL_STYLES.propertyValue}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dispatch Results */}
      <div>
        <span style={{ color: '#585b70' }}>Dispatch:</span>
        <div style={{ paddingLeft: '12px', marginTop: '2px' }}>
          {Object.entries(event.dispatchResults).length === 0 ? (
            <span style={{ color: '#585b70', fontStyle: 'italic' }}>not dispatched</span>
          ) : (
            Object.entries(event.dispatchResults).map(([provider, result]) => (
              <div key={provider} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: result.success ? '#a6e3a1' : '#f38ba8',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#89b4fa' }}>{provider}</span>
                <span style={{ color: result.success ? '#a6e3a1' : '#f38ba8', fontSize: '11px' }}>
                  {result.success ? '✓' : `✗ ${result.error ?? 'unknown error'}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Providers Tab ─────────────────────────────────────────────────

function ProvidersTab({ snapshot }: { snapshot: DebugStoreSnapshot }) {
  if (snapshot.providers.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#585b70' }}>
        No providers registered
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {snapshot.providers.map((p) => (
        <div
          key={p.name}
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(49,50,68,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: p.enabled ? '#a6e3a1' : '#585b70',
                flexShrink: 0,
              }}
            />
            <span style={{ color: '#89b4fa', fontWeight: 600, fontSize: '13px' }}>{p.name}</span>
            <span
              style={{
                padding: '0 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: p.enabled ? 'rgba(166,227,161,0.15)' : 'rgba(88,91,112,0.2)',
                color: p.enabled ? '#a6e3a1' : '#585b70',
              }}
            >
              {p.enabled ? 'ACTIVE' : 'DISABLED'}
            </span>
            <span style={{ color: '#585b70', fontSize: '10px', marginLeft: 'auto' }}>
              priority {p.priority}
            </span>
          </div>
          {p.hasError && (
            <div
              style={{ color: '#f38ba8', fontSize: '11px', marginTop: '4px', paddingLeft: '18px' }}
            >
              ⚠ {p.errorMessage ?? 'Unknown error'}
            </div>
          )}
          {p.initErrors && p.initErrors.length > 0 && (
            <div
              style={{ color: '#f9e2af', fontSize: '11px', marginTop: '4px', paddingLeft: '18px' }}
            >
              Init errors: {p.initErrors.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Retry Tab ─────────────────────────────────────────────────────

function RetryTab({ snapshot }: { snapshot: DebugStoreSnapshot }) {
  return (
    <div style={{ padding: '12px' }}>
      {/* Status Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatusCard
          label="Queued Retries"
          value={snapshot.retryQueueSize}
          color={snapshot.retryQueueSize > 0 ? '#f9e2af' : '#a6e3a1'}
        />
        <StatusCard
          label="Event Errors"
          value={snapshot.errorCount}
          color={snapshot.errorCount > 0 ? '#f38ba8' : '#a6e3a1'}
        />
        <StatusCard label="Total Events" value={snapshot.eventCount} color="#89b4fa" />
      </div>

      {/* Retry Info */}
      <div
        style={{
          backgroundColor: '#11111b',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '12px',
        }}
      >
        <div style={{ color: '#585b70', fontSize: '11px', marginBottom: '4px' }}>
          RETRY CONFIGURATION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          <ConfigItem label="Max Retries" value={String(snapshot.config.maxRetries)} />
          <ConfigItem label="Base Delay" value={`${snapshot.config.retryDelay}ms`} />
          <ConfigItem label="Timeout" value={`${snapshot.config.dispatchTimeout}ms`} />
          <ConfigItem label="Strategy" value={snapshot.config.fallbackStrategy} />
        </div>
      </div>

      {/* Explanation */}
      <div style={{ color: '#585b70', fontSize: '10px', lineHeight: '1.6' }}>
        Failed dispatches are automatically retried with exponential backoff. The retry processor
        checks every 10 seconds for pending retries. Each retry attempt doubles the wait time
        (1000ms → 2000ms → 4000ms → ...).
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#11111b',
        borderRadius: '6px',
        padding: '10px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div style={{ color: '#585b70', fontSize: '10px', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

// ── Config Tab ────────────────────────────────────────────────────

function ConfigTab({ snapshot }: { snapshot: DebugStoreSnapshot }) {
  const config = snapshot.config;

  return (
    <div style={{ padding: '8px 12px' }}>
      {/* Debug Mode */}
      <Section title="Mode">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              padding: '1px 8px',
              borderRadius: '3px',
              fontWeight: 600,
              fontSize: '11px',
              backgroundColor: config.debug ? 'rgba(166,227,161,0.15)' : 'rgba(88,91,112,0.2)',
              color: config.debug ? '#a6e3a1' : '#585b70',
            }}
          >
            {config.debug ? 'DEBUG' : 'PRODUCTION'}
          </span>
          <span style={{ color: '#585b70', fontSize: '10px' }}>
            Sampling: {(config.defaultSamplingRate * 100).toFixed(0)}%
          </span>
        </div>
      </Section>

      {/* Batching */}
      <Section title="Batching">
        <ConfigGrid
          items={[
            { label: 'Batch Size', value: String(config.batchSize) },
            { label: 'Interval', value: `${config.batchInterval}ms` },
          ]}
        />
      </Section>

      {/* Auto-Tracking */}
      <Section title="Auto-Tracking">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
          {Object.entries(config.autoTracking).map(([key, val]) => (
            <span key={key} style={{ fontSize: '11px' }}>
              <span style={{ color: '#585b70' }}>{key}: </span>
              <span style={{ color: val ? '#a6e3a1' : '#585b70', fontWeight: val ? 600 : 400 }}>
                {String(val)}
              </span>
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          color: '#585b70',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ConfigGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
      {items.map((item) => (
        <ConfigItem key={item.label} {...item} />
      ))}
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: '11px' }}>
      <span style={{ color: '#585b70' }}>{label}: </span>
      <span style={{ color: '#cdd6f4' }}>{value}</span>
    </div>
  );
}

// ── Main Panel Component ──────────────────────────────────────────

interface DebugPanelProps {
  initialVisible?: boolean;
}

export function DebugPanel({ initialVisible = false }: DebugPanelProps) {
  const [visible, setVisible] = useState(initialVisible);
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabID>('events');
  const [snapshot, setSnapshot] = useState<DebugStoreSnapshot | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DebugEvent | null>(null);
  const [flashCount, setFlashCount] = useState(0);

  // Subscribe to store
  useEffect(() => {
    const unsub = subscribeToStore((s) => {
      setSnapshot(s);
      // Flash the panel when new events arrive (if minimized)
      if (minimized) {
        setFlashCount((c) => c + 1);
      }
    });
    return unsub;
  }, [minimized]);

  // Keyboard shortcut: Ctrl+Shift+A / Cmd+Shift+A
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        setVisible((v) => !v);
      }
      // ESC to close
      if (e.code === 'Escape' && visible) {
        setVisible(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  // Clear flash after 3 seconds
  useEffect(() => {
    if (flashCount > 0) {
      const t = setTimeout(() => setFlashCount(0), 3000);
      return () => clearTimeout(t);
    }
  }, [flashCount]);

  if (!visible) return null;

  const s = snapshot;

  return (
    <div style={PANEL_STYLES.container}>
      {/* Header */}
      <div
        style={PANEL_STYLES.header}
        onClick={() => setMinimized((m) => !m)}
        onDoubleClick={() => setVisible(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={PANEL_STYLES.title}>⚡ Analytics</span>
          {s && (
            <>
              {s.errorCount > 0 && (
                <span style={{ ...PANEL_STYLES.badge, ...PANEL_STYLES.badgeError }}>
                  {s.errorCount} err
                </span>
              )}
              {s.retryQueueSize > 0 && (
                <span style={{ ...PANEL_STYLES.badge, ...PANEL_STYLES.badgeRetry }}>
                  {s.retryQueueSize} retry
                </span>
              )}
              {s.eventCount > 0 && (
                <span style={{ ...PANEL_STYLES.badge, ...PANEL_STYLES.badgeInfo }}>
                  {s.eventCount}
                </span>
              )}
            </>
          )}
          {minimized && flashCount > 0 && (
            <span style={{ ...PANEL_STYLES.badge, ...PANEL_STYLES.badgeInfo }}>+{flashCount}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Clear */}
          {s && s.eventCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllEvents();
                setSelectedEvent(null);
              }}
              style={{
                ...PANEL_STYLES.button,
                backgroundColor: 'rgba(243,139,168,0.15)',
                color: '#f38ba8',
              }}
              title="Clear all events"
            >
              Clear
            </button>
          )}
          {/* Export */}
          {s && s.eventCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const json = exportEvents();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-events-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                ...PANEL_STYLES.button,
                backgroundColor: 'rgba(137,180,250,0.15)',
                color: '#89b4fa',
              }}
              title="Export as JSON"
            >
              Export
            </button>
          )}
          {/* Minimize/Maximize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((m) => !m);
            }}
            style={{
              ...PANEL_STYLES.button,
              backgroundColor: 'transparent',
              color: '#585b70',
              fontSize: '14px',
              padding: '0 4px',
            }}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '▴' : '▾'}
          </button>
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            style={{
              ...PANEL_STYLES.button,
              backgroundColor: 'transparent',
              color: '#585b70',
              fontSize: '14px',
              padding: '0 4px',
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Minimized: just show header */}
      {minimized ? null : (
        <>
          {/* Tabs */}
          <div style={PANEL_STYLES.tabs}>
            {TABS.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...PANEL_STYLES.tab,
                  ...(activeTab === tab.id ? PANEL_STYLES.tabActive : {}),
                }}
              >
                {tab.label}
                {tab.id === 'retry' && s && s.retryQueueSize > 0 && (
                  <span
                    style={{
                      marginLeft: '4px',
                      padding: '0 4px',
                      borderRadius: '6px',
                      fontSize: '9px',
                      backgroundColor: 'rgba(249,226,175,0.2)',
                      color: '#f9e2af',
                    }}
                  >
                    {s.retryQueueSize}
                  </span>
                )}
                {tab.id === 'events' && s && s.errorCount > 0 && (
                  <span
                    style={{
                      marginLeft: '4px',
                      padding: '0 4px',
                      borderRadius: '6px',
                      fontSize: '9px',
                      backgroundColor: 'rgba(243,139,168,0.2)',
                      color: '#f38ba8',
                    }}
                  >
                    {s.errorCount}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={PANEL_STYLES.content}>
            {!s ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#585b70' }}>
                Loading analytics state...
              </div>
            ) : (
              <>
                {activeTab === 'events' && (
                  <EventsTab
                    events={s.events}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                )}
                {activeTab === 'providers' && <ProvidersTab snapshot={s} />}
                {activeTab === 'retry' && <RetryTab snapshot={s} />}
                {activeTab === 'config' && <ConfigTab snapshot={s} />}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={PANEL_STYLES.footer}>
            <span>Ctrl+Shift+A</span>
            <span style={{ marginLeft: 'auto' }}>{s ? `${s.eventCount} events` : '...'}</span>
          </div>
        </>
      )}
    </div>
  );
}
