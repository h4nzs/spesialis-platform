import { ev } from './_helpers.ts';

// ── Navigation Events ─────────────────────────────────────────────
ev({
  name: 'pageview',
  category: 'navigation',
  version: 1,
  description: 'User visits a page',
  businessObjective: 'Understand traffic patterns and popular content',
  kpi: 'Bounce Rate < 40%',
  owner: 'product',
  properties: { required: ['url', 'title'], optional: ['referrer'] },
  status: 'active',
});

ev({
  name: 'navigation_click',
  category: 'navigation',
  version: 1,
  description: 'User clicks a navigation link',
  businessObjective: 'Measure navigation effectiveness',
  kpi: 'Navigation CTR',
  owner: 'product',
  properties: { required: ['destination', 'label'], optional: ['section'] },
  status: 'active',
});

ev({
  name: 'cta_click',
  category: 'navigation',
  version: 1,
  description: 'User clicks a call-to-action button',
  businessObjective: 'Drive conversions from landing pages',
  kpi: 'CTA Click Rate > 5%',
  owner: 'product',
  properties: { required: ['section', 'cta', 'position', 'page'], optional: [] },
  goals: ['cta_engagement'],
  status: 'active',
});

ev({
  name: 'outbound_link_click',
  category: 'navigation',
  version: 1,
  description: 'User clicks an outbound link to external site',
  businessObjective: 'Track external referral traffic and outbound engagement',
  kpi: 'Outbound Click Rate',
  owner: 'product',
  properties: { required: ['url', 'text', 'destination'], optional: [] },
  status: 'active',
});

ev({
  name: 'download_click',
  category: 'navigation',
  version: 1,
  description: 'User downloads a file from the site',
  businessObjective: 'Track file download engagement',
  kpi: 'Download Count',
  owner: 'product',
  properties: { required: ['file', 'type'], optional: ['size'] },
  status: 'active',
});

ev({
  name: 'history_navigation',
  category: 'navigation',
  version: 1,
  description: 'User navigates via browser history (back/forward/SPA)',
  businessObjective: 'Track internal navigation patterns',
  kpi: 'Navigation Flow',
  owner: 'product',
  properties: { required: ['from', 'to', 'navigation_method'], optional: [] },
  status: 'active',
});
