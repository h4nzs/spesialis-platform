import { ev } from './_helpers.ts';

// ── Search Events ─────────────────────────────────────────────────
ev({
  name: 'search_start',
  category: 'search',
  version: 1,
  description: 'User initiates a search',
  businessObjective: 'Track search feature adoption',
  kpi: 'Search Usage Rate',
  owner: 'product',
  properties: { required: [], optional: ['query'] },
  status: 'active',
});

ev({
  name: 'search_filter',
  category: 'search',
  version: 1,
  description: 'User applies a filter to search results',
  businessObjective: 'Track filter feature usage',
  kpi: 'Filter Usage Rate',
  owner: 'product',
  properties: { required: ['filter', 'value', 'result_count'], optional: [] },
  status: 'active',
});

ev({
  name: 'search_result',
  category: 'search',
  version: 1,
  description: 'Search results are displayed to the user',
  businessObjective: 'Track search effectiveness and zero-result rate',
  kpi: 'Search Result Rate > 80%',
  owner: 'product',
  properties: { required: ['query', 'result_count', 'has_results'], optional: [] },
  status: 'active',
});
