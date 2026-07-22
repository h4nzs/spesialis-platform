import { ev } from './_helpers.ts';

// ── Corporate Events ──────────────────────────────────────────────
ev({
  name: 'corporate_landing_view',
  category: 'corporate',
  version: 1,
  description: 'User views the corporate landing page',
  businessObjective: 'Track corporate page engagement',
  kpi: 'Corporate Page Conversion > 5%',
  owner: 'corporate',
  properties: { required: [], optional: [] },
  status: 'active',
});

ev({
  name: 'inquiry_start',
  category: 'corporate',
  version: 1,
  description: 'Corporate user starts an inquiry',
  businessObjective: 'Track corporate inquiry initiation',
  kpi: 'Inquiry Start Rate',
  owner: 'corporate',
  properties: { required: [], optional: [] },
  funnel: 'corporate_lead',
  status: 'active',
});

ev({
  name: 'inquiry_submit',
  category: 'corporate',
  version: 1,
  description: 'Corporate user submits an inquiry form',
  businessObjective: 'Track corporate lead generation',
  kpi: 'Corporate Lead Conversion > 10%',
  owner: 'corporate',
  properties: {
    required: ['company_name', 'service_interest'],
    optional: ['industry', 'employees'],
  },
  goals: ['corporate_lead'],
  status: 'active',
});

ev({
  name: 'corporate_dashboard_view',
  category: 'corporate',
  version: 1,
  description: 'Corporate user views their dashboard',
  businessObjective: 'Track corporate dashboard adoption',
  kpi: 'Corporate Dashboard DAU',
  owner: 'corporate',
  properties: { required: [], optional: [] },
  status: 'active',
});
