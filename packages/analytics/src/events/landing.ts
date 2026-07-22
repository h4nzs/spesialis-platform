import { ev } from './_helpers.ts';

// ── Homepage / Landing Events ─────────────────────────────────────
ev({
  name: 'hero_view',
  category: 'landing',
  version: 1,
  description: 'User views the hero section',
  businessObjective: 'Measure hero section visibility and engagement',
  kpi: 'Hero Engagement',
  owner: 'product',
  properties: { required: ['duration'], optional: [] },
  status: 'active',
});

ev({
  name: 'hero_cta_click',
  category: 'landing',
  version: 1,
  description: 'User clicks a CTA button in the hero section',
  businessObjective: 'Measure hero CTA conversion rate',
  kpi: 'Hero CTA CTR > 10%',
  owner: 'product',
  properties: { required: ['cta', 'position'], optional: [] },
  status: 'active',
});

ev({
  name: 'service_category_click',
  category: 'landing',
  version: 1,
  description: 'User clicks a service category on the homepage',
  businessObjective: 'Track category discovery engagement',
  kpi: 'Category Click Rate',
  owner: 'product',
  properties: { required: ['category', 'position'], optional: [] },
  status: 'active',
});

ev({
  name: 'testimonials_view',
  category: 'landing',
  version: 1,
  description: 'User views the testimonials section',
  businessObjective: 'Track social proof section engagement',
  kpi: 'Testimonials Engagement',
  owner: 'product',
  properties: { required: ['count'], optional: [] },
  status: 'active',
});

ev({
  name: 'partner_cta_click',
  category: 'landing',
  version: 1,
  description: 'User clicks CTA in partner section on homepage',
  businessObjective: 'Drive partner registration from landing page',
  kpi: 'Partner CTA → Registration Rate',
  owner: 'product',
  properties: { required: ['source'], optional: [] },
  goals: ['cta_engagement'],
  funnel: 'partner_registration',
  status: 'active',
});

ev({
  name: 'corporate_cta_click',
  category: 'landing',
  version: 1,
  description: 'User clicks CTA in corporate section on homepage',
  businessObjective: 'Drive corporate inquiry from landing page',
  kpi: 'Corporate CTA → Inquiry Rate',
  owner: 'product',
  properties: { required: ['source'], optional: [] },
  goals: ['cta_engagement'],
  funnel: 'corporate_lead',
  status: 'active',
});

ev({
  name: 'footer_cta_click',
  category: 'landing',
  version: 1,
  description: 'User clicks a CTA button in the footer',
  businessObjective: 'Measure footer section effectiveness',
  kpi: 'Footer CTA Click Rate',
  owner: 'product',
  properties: { required: ['cta', 'section'], optional: [] },
  status: 'active',
});

ev({
  name: 'whatsapp_click',
  category: 'landing',
  version: 1,
  description: 'User clicks WhatsApp CTA button',
  businessObjective: 'Track WhatsApp engagement as primary conversion channel',
  kpi: 'WhatsApp Click Rate',
  owner: 'product',
  properties: { required: ['source', 'page'], optional: [] },
  status: 'active',
});

ev({
  name: 'service_view',
  category: 'landing',
  version: 1,
  description: 'User views a service card on the homepage',
  businessObjective: 'Measure service discovery engagement',
  kpi: 'Service View → Booking Rate',
  owner: 'product',
  properties: { required: ['service_id', 'category', 'slug'], optional: [] },
  status: 'active',
});

ev({
  name: 'service_book_click',
  category: 'landing',
  version: 1,
  description: 'User clicks "Book" on a service card',
  businessObjective: 'Drive booking initiation from service cards',
  kpi: 'Service Click → Booking Rate',
  owner: 'product',
  properties: { required: ['service_id', 'category', 'price'], optional: [] },
  status: 'active',
});

ev({
  name: 'search_result',
  category: 'landing',
  version: 1,
  description: 'User views search results',
  businessObjective: 'Track search effectiveness',
  kpi: 'Search → Booking Rate',
  owner: 'product',
  properties: { required: ['query', 'result_count'], optional: ['category'] },
  status: 'active',
});
