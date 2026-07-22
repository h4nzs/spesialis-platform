import { ev } from './_helpers.ts';

// ── Partner Events ────────────────────────────────────────────────
ev({
  name: 'partner_register_start',
  category: 'partner',
  version: 1,
  description: 'Partner starts the registration flow',
  businessObjective: 'Track partner acquisition pipeline',
  kpi: 'Partner Registration Start Rate',
  owner: 'partner',
  properties: { required: [], optional: [] },
  funnel: 'partner_registration',
  status: 'active',
});

ev({
  name: 'partner_register_form_step',
  category: 'partner',
  version: 1,
  description: 'Partner progresses through registration form steps',
  businessObjective: 'Track partner registration form completion',
  kpi: 'Partner Form Completion Rate > 80%',
  owner: 'partner',
  properties: { required: ['step', 'step_name'], optional: [] },
  status: 'active',
});

ev({
  name: 'partner_register_complete',
  category: 'partner',
  version: 1,
  description: 'Partner completes registration',
  businessObjective: 'Track successful partner signups',
  kpi: 'Partner Acquisition Growth > 20% MoM',
  owner: 'partner',
  properties: { required: ['partner_id'], optional: [] },
  goals: ['partner_signup'],
  status: 'active',
});

ev({
  name: 'partner_dashboard_view',
  category: 'partner',
  version: 1,
  description: 'Partner views their dashboard',
  businessObjective: 'Track partner dashboard adoption',
  kpi: 'Partner Dashboard DAU',
  owner: 'partner',
  properties: { required: [], optional: [] },
  status: 'active',
});

ev({
  name: 'partner_job_accept',
  category: 'partner',
  version: 1,
  description: 'Partner accepts a job assignment',
  businessObjective: 'Track partner reliability',
  kpi: 'Acceptance Rate > 80%',
  owner: 'partner',
  properties: { required: ['assignment_id', 'booking_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'partner_job_reject',
  category: 'partner',
  version: 1,
  description: 'Partner rejects a job assignment',
  businessObjective: 'Track rejection reasons',
  kpi: 'Rejection Rate < 20%',
  owner: 'partner',
  properties: { required: ['assignment_id', 'booking_id', 'reason'], optional: [] },
  status: 'active',
});

ev({
  name: 'partner_availability_update',
  category: 'partner',
  version: 1,
  description: 'Partner updates their availability status',
  businessObjective: 'Track partner availability patterns',
  kpi: 'Partner Availability Rate > 80%',
  owner: 'partner',
  properties: { required: ['status'], optional: [] },
  status: 'active',
});
