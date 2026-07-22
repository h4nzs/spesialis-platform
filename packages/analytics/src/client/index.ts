// =============================================================================
// Analytics Platform — Automatic Client Tracking
// =============================================================================
// Automatic tracking for:
//   - Pageviews (initial + SPA)
//   - Session start / end
//   - Scroll depth (25/50/75/90/100%)
//   - Page engagement time
//   - Outbound links + Downloads
//   - JavaScript errors + unhandled rejections
//   - Core Web Vitals (LCP, CLS, FID, TTFB)
//   - Visibility change (tab switch)
//   - History navigation (popstate, SPA pushState/replaceState)
// =============================================================================

import { track } from '../core/tracker.ts';
import { getConfig } from '../core/tracker.ts';
import type { AnalyticsConfig } from '../types.ts';

// ── Pageview Tracking ─────────────────────────────────────────────

export function trackInitialPageview(): void {
  track('pageview', {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer || undefined,
  });
}

export function trackSPAPageview(url: string, title: string): void {
  track('pageview', { url, title });
}

// ── Session Tracking ─────────────────────────────────────────────

export function trackSessionStart(): void {
  const params = new URLSearchParams(window.location.search);
  const props: Record<string, string | undefined> = {};

  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');

  if (utmSource) props.utm_source = utmSource;
  if (utmMedium) props.utm_medium = utmMedium;
  if (utmCampaign) props.utm_campaign = utmCampaign;
  if (document.referrer) props.referrer = document.referrer;

  track(
    'session_start',
    props as {
      referrer?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    },
  );
}

// ── Scroll Depth Tracking ────────────────────────────────────────

export function trackScrollDepth(config: AnalyticsConfig['autoTracking']): () => void {
  if (!config.scroll) return () => {};

  const DEPTHS = [25, 50, 75, 90, 100];
  const triggered = new Set<number>();

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const percent = Math.round((scrollTop / docHeight) * 100);

    for (const depth of DEPTHS) {
      if (percent >= depth && !triggered.has(depth)) {
        triggered.add(depth);
        track('scroll_depth', { depth, page: window.location.pathname });
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

// ── Page Engagement Tracking ──────────────────────────────────────

export function trackPageEngagement(config: AnalyticsConfig['autoTracking']): () => void {
  if (!config.engagement) return () => {};

  let engagedTime = 0;
  let isEngaged = false;
  let lastEngagement = Date.now();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const INTERVAL = 30000;

  const markEngaged = () => {
    if (!isEngaged) isEngaged = true;
    lastEngagement = Date.now();
  };

  window.addEventListener('scroll', markEngaged, { passive: true });
  window.addEventListener('click', markEngaged, { passive: true });
  window.addEventListener('keydown', markEngaged, { passive: true });

  intervalId = setInterval(() => {
    if (!isEngaged) return;

    const now = Date.now();
    const elapsed = now - lastEngagement;

    if (elapsed > 60000) {
      if (engagedTime > 0) {
        track('page_engagement', {
          duration: engagedTime,
          page: window.location.pathname,
          interaction_count: 0,
        });
        engagedTime = 0;
      }
      isEngaged = false;
      return;
    }

    engagedTime += INTERVAL;
    lastEngagement = now;
  }, INTERVAL);

  return () => {
    if (intervalId !== null) clearInterval(intervalId);
    window.removeEventListener('scroll', markEngaged);
    window.removeEventListener('click', markEngaged);
    window.removeEventListener('keydown', markEngaged);
  };
}

// ── Outbound Links + Downloads ────────────────────────────────────

const SITE_ORIGIN = typeof location !== 'undefined' ? location.origin : '';
const DOWNLOAD_EXTENSIONS =
  /\.(pdf|doc|docx|xls|xlsx|zip|rar|tar|gz|exe|dmg|apk|iso|mp4|mov|avi)$/i;

export function trackOutboundLinks(config: AnalyticsConfig['autoTracking']): () => void {
  if (!config.outboundLinks && !config.downloads) return () => {};

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a') as HTMLAnchorElement | null;
    if (!link?.href) return;

    // Skip same-origin links
    if (link.href.startsWith(SITE_ORIGIN)) return;

    const text = link.textContent?.trim() || '(no text)';
    const href = link.href;

    // Strip query params and hash for extension matching
    const cleanPath = href.split('?')[0] ?? '';
    const cleanUrl = cleanPath.split('#')[0] ?? '';

    // Check download first
    if (config.downloads && DOWNLOAD_EXTENSIONS.test(cleanUrl)) {
      const filename = cleanUrl.split('/').pop() || href;
      const ext = filename.split('.').pop() || 'unknown';
      track('download_click', { file: filename, type: ext });
      return;
    }

    // Check outbound link (external domain)
    if (config.outboundLinks && href.startsWith('https://') && !href.startsWith(SITE_ORIGIN)) {
      const destination = new URL(href).hostname;
      track('outbound_link_click', { url: href, text, destination });
    }

    // Protocol-relative URLs (//cdn.example.com)
    if (config.outboundLinks && href.startsWith('//')) {
      const destination = new URL(href, SITE_ORIGIN).hostname;
      if (destination !== new URL(SITE_ORIGIN).hostname) {
        track('outbound_link_click', { url: href, text, destination });
      }
    }
  };

  document.addEventListener('click', onClick, { passive: true });
  return () => document.removeEventListener('click', onClick);
}

// ── Error Tracking ───────────────────────────────────────────────

export function trackErrors(config: AnalyticsConfig['autoTracking']): () => void {
  if (!config.errors) return () => {};

  const onError = (event: ErrorEvent) => {
    if (event.target && (event.target as HTMLElement).tagName) {
      const el = event.target as HTMLElement;
      if ('src' in el) {
        track('api_error', {
          endpoint: (el as HTMLImageElement | HTMLScriptElement).src,
          // TODO(spesialis-997): Use distinct keys (http_status vs booking_status)
          // instead of shared "status" key with conflicting types (number vs string)
          status: 0 as unknown as string,
          method: 'GET',
        });
      }
      return;
    }
    track('error_boundary_caught', {
      component: 'window.onerror',
      error: event.message ?? String(event.error),
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    track('error_boundary_caught', {
      component: 'unhandledrejection',
      error: event.reason?.message ?? String(event.reason),
    });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

// ── Core Web Vitals ──────────────────────────────────────────────

export function trackCoreWebVitals(config: AnalyticsConfig['autoTracking']): () => void {
  if (!config.performance) return () => {};

  const cleanups: (() => void)[] = [];

  if ('PerformanceObserver' in window) {
    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.length > 0 ? entries[entries.length - 1] : null;
        if (!last) return;
        track('lcp_measure', {
          value: Math.round(last.startTime),
          element: (last as unknown as { element?: string }).element || undefined,
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      cleanups.push(() => lcpObserver.disconnect());
    } catch {
      /* silent */
    }

    // CLS — reset on SPA navigation via custom event
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
            clsValue += (entry as unknown as { value: number }).value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Reset CLS on SPA navigation
      const resetCls = () => {
        clsValue = 0;
      };
      window.addEventListener('analytics:spa-navigation', resetCls);

      // Send CLS on page unload
      const sendCls = () => {
        if (clsValue > 0) {
          track('cls_measure', { value: Math.round(clsValue * 1000) / 1000 });
        }
      };
      window.addEventListener('beforeunload', sendCls);

      cleanups.push(() => {
        clsObserver.disconnect();
        window.removeEventListener('analytics:spa-navigation', resetCls);
        window.removeEventListener('beforeunload', sendCls);
      });
    } catch {
      /* silent */
    }

    // FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid =
            (entry as unknown as { processingStart: number }).processingStart - entry.startTime;
          track('fid_measure', { value: Math.round(fid) });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      cleanups.push(() => fidObserver.disconnect());
    } catch {
      /* silent */
    }
  }

  // TTFB
  if ('performance' in window && 'getEntriesByType' in performance) {
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (nav) {
      track('ttfb_measure', { value: Math.round(nav.responseStart - nav.requestStart) });
    } else {
      // Deprecated Navigation Timing API fallback
      const timing = performance.timing;
      if (timing) {
        setTimeout(() => {
          track('ttfb_measure', { value: timing.responseStart - timing.requestStart });
        }, 0);
      }
    }
  }

  return () => cleanups.forEach((fn) => fn());
}

// ── Visibility Change ────────────────────────────────────────────

export function trackVisibilityChange(): () => void {
  if (typeof document === 'undefined') return () => {};

  let lastVisible = Date.now();
  let wasHidden = document.hidden;

  const handleVisibility = () => {
    const now = Date.now();
    const hidden = document.hidden;
    const duration = now - lastVisible;

    track('visibility_change', {
      hidden,
      previous_visibility: wasHidden ? 'hidden' : 'visible',
      duration: hidden ? duration : 0,
    });

    lastVisible = now;
    wasHidden = hidden;
  };

  document.addEventListener('visibilitychange', handleVisibility, { passive: true });
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}

// ── History Navigation ───────────────────────────────────────────
// PUSHSTATE/RPLACESTATE patching is handled centrally in initAutoTracking
// to avoid double-patching conflicts with trackSessionEnd.
// This function only handles popstate (back/forward navigation).

export function trackHistoryNavigation(getPreviousUrl: () => string): () => void {
  const onPopState = () => {
    const from = getPreviousUrl();
    const to = window.location.href;
    if (from !== to) {
      track('history_navigation', { from, to, method: 'popstate' });
    }
  };

  window.addEventListener('popstate', onPopState);
  return () => window.removeEventListener('popstate', onPopState);
}

// ── Session End ──────────────────────────────────────────────────
// PUSHSTATE patching for page view counting is handled centrally
// in initAutoTracking. This function only handles session end events.

export function trackSessionEnd(getPageViewCount: () => number): () => void {
  const sessionStart = Date.now();

  const sendSessionEnd = () => {
    const duration = Date.now() - sessionStart;
    track('session_end', {
      duration,
      page_views: getPageViewCount(),
      page: window.location.pathname,
    });
  };

  const onVisibility = () => {
    if (document.hidden) sendSessionEnd();
  };

  const onBeforeUnload = () => sendSessionEnd();

  document.addEventListener('visibilitychange', onVisibility, { passive: true });
  window.addEventListener('beforeunload', onBeforeUnload);

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('beforeunload', onBeforeUnload);
  };
}

// ── Init — Bootstrap All Auto-Tracking ───────────────────────────
// Central pushState/replaceState patching to avoid double-patching
// conflicts (both trackHistoryNavigation and trackSessionEnd need it).

export function initAutoTracking(configOverrides?: Partial<AnalyticsConfig>): () => void {
  const config = getConfig();
  const autoConfig = { ...config.autoTracking, ...configOverrides?.autoTracking };

  const cleanups: (() => void)[] = [];

  // ── Shared state for history navigation + session counting ───
  let previousUrl = window.location.href;
  let pageViewCount = 1;
  const getPreviousUrl = () => previousUrl;
  const getPageViewCount = () => pageViewCount;

  // Patch pushState/replaceState ONCE for all consumers
  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    const from = previousUrl;
    const to = args[2]
      ? new URL(args[2] as string, window.location.origin).href
      : window.location.href;
    origPushState.apply(history, args);
    if (from !== to) {
      // Track history navigation
      if (autoConfig.historyNavigation !== false) {
        track('history_navigation', { from, to, method: 'pushstate' });
      }
      previousUrl = to;
      pageViewCount++;

      // Reset CLS on SPA navigation via custom event
      window.dispatchEvent(new CustomEvent('analytics:spa-navigation'));
    }
  };

  history.replaceState = function (...args) {
    const from = previousUrl;
    const to = args[2]
      ? new URL(args[2] as string, window.location.origin).href
      : window.location.href;
    origReplaceState.apply(history, args);
    if (from !== to) {
      if (autoConfig.historyNavigation !== false) {
        track('history_navigation', { from, to, method: 'replacestate' });
      }
      previousUrl = to;
    }
  };

  // Restore original history methods on cleanup
  cleanups.push(() => {
    history.pushState = origPushState;
    history.replaceState = origReplaceState;
  });

  // ── Pageview ────────────────────────────────────────────────
  if (autoConfig.pageview) {
    trackInitialPageview();
  }

  // ── Session start ───────────────────────────────────────────
  trackSessionStart();

  // ── Scroll ──────────────────────────────────────────────────
  if (autoConfig.scroll) {
    cleanups.push(trackScrollDepth(autoConfig));
  }

  // ── Engagement ──────────────────────────────────────────────
  if (autoConfig.engagement) {
    cleanups.push(trackPageEngagement(autoConfig));
  }

  // ── Outbound links + downloads ──────────────────────────────
  cleanups.push(trackOutboundLinks(autoConfig));

  // ── Errors ──────────────────────────────────────────────────
  if (autoConfig.errors) {
    cleanups.push(trackErrors(autoConfig));
  }

  // ── Core Web Vitals ─────────────────────────────────────────
  if (autoConfig.performance) {
    cleanups.push(trackCoreWebVitals(autoConfig));
  }

  // ── Visibility change ──────────────────────────────────────
  if (autoConfig.visibility !== false) {
    cleanups.push(trackVisibilityChange());
  }

  // ── History navigation (popstate only — pushState via patch) ─
  if (autoConfig.historyNavigation !== false) {
    cleanups.push(trackHistoryNavigation(getPreviousUrl));
  }

  // ── Session end ────────────────────────────────────────────
  cleanups.push(trackSessionEnd(getPageViewCount));

  return () => cleanups.forEach((fn) => fn());
}
