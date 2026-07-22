import { ev } from './_helpers.ts';

// ── CMS Events ────────────────────────────────────────────────────
ev({
  name: 'article_view',
  category: 'cms',
  version: 1,
  description: 'User reads an article',
  businessObjective: 'Track content engagement',
  kpi: 'Blog Engagement',
  owner: 'cms',
  properties: { required: ['article_id', 'category', 'slug'], optional: [] },
  status: 'active',
});

ev({
  name: 'article_list_view',
  category: 'cms',
  version: 1,
  description: 'User views a list of articles',
  businessObjective: 'Track content discovery',
  kpi: 'Article List → Article View Rate',
  owner: 'cms',
  properties: { required: ['page'], optional: ['category'] },
  status: 'active',
});

ev({
  name: 'faq_view',
  category: 'cms',
  version: 1,
  description: 'User views the FAQ page',
  businessObjective: 'Track FAQ page engagement',
  kpi: 'FAQ View Rate',
  owner: 'cms',
  properties: { required: [], optional: ['category'] },
  status: 'active',
});

ev({
  name: 'faq_open',
  category: 'cms',
  version: 1,
  description: 'User opens an FAQ item',
  businessObjective: 'Track FAQ usefulness',
  kpi: 'FAQ View Rate',
  owner: 'cms',
  properties: { required: ['faq_id', 'question', 'category'], optional: [] },
  status: 'active',
});
