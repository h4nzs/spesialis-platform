// =============================================================================
// Analytics Bootstrap — Client Entry
// =============================================================================
// Called once at app startup from BaseLayout.astro <script> tag.
// Initialises the analytics SDK, registers Plausible provider,
// and starts automatic tracking (pageview, scroll, engagement, etc.).
//
// Env vars (set in .env or docker-compose):
//   PUBLIC_PLAUSIBLE_DOMAIN  — Plausible host (e.g. stats.ahlipanggilan.id)
//   PUBLIC_SITE_DOMAIN       — Site domain (e.g. ahlipanggilan.id)
// =============================================================================

import { analyticsInit } from '@spesialis/analytics';

const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN ?? '';
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN ?? 'ahlipanggilan.id';

analyticsInit({
  providers: {
    plausible: {
      enabled: !!plausibleDomain,
      options: {
        domain: plausibleDomain || 'stats.ahlipanggilan.id',
        siteDomain,
      },
      priority: 10,
    },
  },
  debug: false,
  defaultSamplingRate: 0,
  autoTracking: {
    pageview: false, // Plausible script handles pageviews natively — SDK only sends custom events
    scroll: true,
    engagement: true,
    outboundLinks: true,
    downloads: true,
    errors: true,
    performance: true,
    visibility: true,
    historyNavigation: true,
  },
});
