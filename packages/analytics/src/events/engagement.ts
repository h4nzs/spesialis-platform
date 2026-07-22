import { ev } from './_helpers.ts';

// ── Engagement Events ─────────────────────────────────────────────
ev({
  name: 'page_engagement',
  category: 'engagement',
  version: 1,
  description: 'User engagement on a page over time',
  businessObjective: 'Measure true user engagement (active time on page)',
  kpi: 'Avg Engagement Time > 30s',
  owner: 'product',
  properties: { required: ['duration', 'page', 'interaction_count'], optional: [] },
  status: 'active',
});

ev({
  name: 'scroll_depth',
  category: 'engagement',
  version: 1,
  description: 'User scrolls to a certain depth on the page',
  businessObjective: 'Measure content engagement',
  kpi: 'Scroll Depth > 50% average',
  owner: 'product',
  properties: { required: ['depth', 'page'], optional: [] },
  goals: ['user_engagement'],
  status: 'active',
});

ev({
  name: 'session_start',
  category: 'engagement',
  version: 1,
  description: 'New session started',
  businessObjective: 'Track unique sessions and traffic sources',
  kpi: 'Session Count',
  owner: 'product',
  properties: { required: [], optional: ['referrer', 'utm_source', 'utm_medium', 'utm_campaign'] },
  status: 'active',
});

ev({
  name: 'session_end',
  category: 'engagement',
  version: 1,
  description: 'Session ended (tab closed, navigated away)',
  businessObjective: 'Track session duration and engagement',
  kpi: 'Avg Session Duration',
  owner: 'product',
  properties: { required: ['duration', 'page_views', 'page'], optional: [] },
  status: 'active',
});

ev({
  name: 'visibility_change',
  category: 'engagement',
  version: 1,
  description: 'Page visibility changed (tab switch, minimize, etc.)',
  businessObjective: 'Measure true user engagement vs open tabs',
  kpi: 'Visible Time Ratio',
  owner: 'product',
  properties: { required: ['hidden', 'duration'], optional: ['previous_visibility'] },
  status: 'active',
});
