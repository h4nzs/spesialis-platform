import { ev } from './_helpers.ts';

// ── Service Events ────────────────────────────────────────────────
ev({
  name: 'service_detail_view',
  category: 'service',
  version: 1,
  description: 'User views a service detail page',
  businessObjective: 'Measure service detail engagement',
  kpi: 'Service Detail → Booking Rate',
  owner: 'product',
  properties: { required: ['service_id', 'category', 'slug'], optional: [] },
  status: 'active',
});

ev({
  name: 'service_faq_open',
  category: 'service',
  version: 1,
  description: 'User opens an FAQ item on a service detail page',
  businessObjective: 'Measure FAQ usefulness on service pages',
  kpi: 'FAQ Engagement on Service',
  owner: 'product',
  properties: { required: ['service_id', 'faq_id', 'question'], optional: [] },
  status: 'active',
});

ev({
  name: 'service_gallery_view',
  category: 'service',
  version: 1,
  description: 'User views the gallery section on a service page',
  businessObjective: 'Track gallery engagement',
  kpi: 'Gallery View Rate',
  owner: 'product',
  properties: { required: ['service_id', 'image_count'], optional: [] },
  status: 'active',
});
