import { ev } from './_helpers.ts';

// ── Performance Events ────────────────────────────────────────────
ev({
  name: 'lcp_measure',
  category: 'performance',
  version: 1,
  description: 'Largest Contentful Paint measurement',
  businessObjective: 'Monitor Core Web Vitals',
  kpi: 'LCP < 2.5s',
  owner: 'engineering',
  properties: { required: ['value'], optional: ['element'] },
  status: 'active',
});

ev({
  name: 'cls_measure',
  category: 'performance',
  version: 1,
  description: 'Cumulative Layout Shift measurement',
  businessObjective: 'Monitor Core Web Vitals',
  kpi: 'CLS < 0.1',
  owner: 'engineering',
  properties: { required: ['value'], optional: [] },
  status: 'active',
});

ev({
  name: 'fid_measure',
  category: 'performance',
  version: 1,
  description: 'First Input Delay measurement (Core Web Vital)',
  businessObjective: 'Monitor interaction responsiveness',
  kpi: 'FID < 100ms',
  owner: 'engineering',
  properties: { required: ['value'], optional: [] },
  status: 'active',
});

ev({
  name: 'ttfb_measure',
  category: 'performance',
  version: 1,
  description: 'Time to First Byte measurement',
  businessObjective: 'Monitor server response time',
  kpi: 'TTFB < 500ms',
  owner: 'engineering',
  properties: { required: ['value'], optional: [] },
  status: 'active',
});
