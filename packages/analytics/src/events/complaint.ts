import { ev } from './_helpers.ts';

// ── Complaint Events ──────────────────────────────────────────────
ev({
  name: 'complaint_start',
  category: 'complaint',
  version: 1,
  description: 'User starts filing a complaint',
  businessObjective: 'Track complaint feature adoption',
  kpi: 'Complaint Rate < 5%',
  owner: 'product',
  properties: { required: ['booking_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'complaint_submit',
  category: 'complaint',
  version: 1,
  description: 'User submits a complaint',
  businessObjective: 'Track complaint resolution',
  kpi: 'Complaint Resolution Rate > 90%',
  owner: 'product',
  properties: { required: ['complaint_id', 'booking_id', 'category'], optional: [] },
  status: 'active',
});
