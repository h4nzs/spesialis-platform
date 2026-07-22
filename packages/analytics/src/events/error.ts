import { ev } from './_helpers.ts';

// ── Error Events ──────────────────────────────────────────────────
ev({
  name: 'page_404',
  category: 'error',
  version: 1,
  description: 'User encounters a 404 page',
  businessObjective: 'Improve site navigation and fix broken links',
  kpi: '404 Rate < 0.1%',
  owner: 'seo',
  properties: { required: ['path'], optional: ['referrer'] },
  status: 'active',
});

ev({
  name: 'api_error',
  category: 'error',
  version: 1,
  description: 'API request returns an error',
  businessObjective: 'Monitor API health',
  kpi: 'API Error Rate < 1%',
  owner: 'engineering',
  properties: { required: ['endpoint', 'status', 'method'], optional: [] },
  status: 'active',
});

ev({
  name: 'error_boundary_caught',
  category: 'error',
  version: 1,
  description: 'JavaScript error caught by React error boundary or window.onerror',
  businessObjective: 'Monitor frontend errors for P0/P1 detection',
  kpi: 'JS Error Rate < 0.1%',
  owner: 'engineering',
  properties: { required: ['component', 'error'], optional: [] },
  status: 'active',
});

ev({
  name: 'page_500',
  category: 'error',
  version: 1,
  description: 'User encounters a 500 server error page',
  businessObjective: 'Track server error frequency',
  kpi: '500 Rate < 0.01%',
  owner: 'engineering',
  properties: { required: ['path'], optional: ['error'] },
  status: 'active',
});
