import { ev } from './_helpers.ts';

// ── SEO Events ────────────────────────────────────────────────────
ev({
  name: 'seo_meta_update',
  category: 'seo',
  version: 1,
  description: 'SEO metadata is updated for an entity',
  businessObjective: 'Track SEO metadata management activity',
  kpi: 'SEO Meta Update Count',
  owner: 'seo',
  properties: { required: ['entity_type', 'entity_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'seo_redirect_create',
  category: 'seo',
  version: 1,
  description: 'A redirect rule is created',
  businessObjective: 'Track redirect management activity',
  kpi: 'Redirect Creation Count',
  owner: 'seo',
  properties: { required: ['source', 'destination'], optional: [] },
  status: 'active',
});

ev({
  name: 'seo_sitemap_generate',
  category: 'seo',
  version: 1,
  description: 'Sitemap is generated',
  businessObjective: 'Track sitemap generation',
  kpi: 'Sitemap Generation Count',
  owner: 'seo',
  properties: { required: ['page_count'], optional: [] },
  status: 'active',
});
