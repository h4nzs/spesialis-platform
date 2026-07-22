import { ev } from './_helpers.ts';

// ── Dashboard Events ──────────────────────────────────────────────
ev({
  name: 'dashboard_view',
  category: 'dashboard',
  version: 1,
  description: 'User views a dashboard section',
  businessObjective: 'Track dashboard feature adoption',
  kpi: 'Dashboard Engagement',
  owner: 'product',
  properties: { required: ['role', 'section'], optional: [] },
  status: 'active',
});

ev({
  name: 'dashboard_filter',
  category: 'dashboard',
  version: 1,
  description: 'User applies a filter on dashboard',
  businessObjective: 'Track dashboard filter feature usage',
  kpi: 'Dashboard Filter Usage',
  owner: 'product',
  properties: { required: ['role', 'filter', 'value'], optional: [] },
  status: 'active',
});

ev({
  name: 'dashboard_export',
  category: 'dashboard',
  version: 1,
  description: 'User exports data from dashboard',
  businessObjective: 'Track dashboard export feature adoption',
  kpi: 'Dashboard Export Count',
  owner: 'product',
  properties: { required: ['role', 'type', 'row_count'], optional: [] },
  status: 'active',
});
