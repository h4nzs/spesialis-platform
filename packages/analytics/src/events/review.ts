import { ev } from './_helpers.ts';

// ── Review Events ─────────────────────────────────────────────────
ev({
  name: 'review_start',
  category: 'review',
  version: 1,
  description: 'User starts writing a review',
  businessObjective: 'Track review feature adoption',
  kpi: 'Review Start Rate',
  owner: 'product',
  properties: { required: ['booking_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'review_submit',
  category: 'review',
  version: 1,
  description: 'User submits a review',
  businessObjective: 'Track review submission rate',
  kpi: 'Review Completion Rate > 50%',
  owner: 'product',
  properties: { required: ['booking_id', 'rating'], optional: [] },
  status: 'active',
});
