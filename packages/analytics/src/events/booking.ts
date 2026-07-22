import { ev } from './_helpers.ts';

// ── Booking Events ────────────────────────────────────────────────
ev({
  name: 'booking_start',
  category: 'booking',
  version: 1,
  description: 'User begins the booking process',
  businessObjective: 'Track booking initiation rate',
  kpi: 'Booking Funnel Conversion > 15%',
  owner: 'booking',
  properties: { required: ['service_id', 'customer_type'], optional: [] },
  funnel: 'booking',
  status: 'active',
});

ev({
  name: 'booking_submit',
  category: 'booking',
  version: 1,
  description: 'User submits a completed booking form',
  businessObjective: 'Track successful booking submissions',
  kpi: 'Booking Conversion Rate > 15%',
  owner: 'booking',
  properties: { required: ['service_id', 'booking_id', 'customer_type'], optional: [] },
  goals: ['booking_completed'],
  funnel: 'booking',
  status: 'active',
});

ev({
  name: 'booking_form_step',
  category: 'booking',
  version: 1,
  description: 'User progresses through a multi-step booking form',
  businessObjective: 'Track booking form step completion',
  kpi: 'Booking Form Completion Rate > 80%',
  owner: 'booking',
  properties: { required: ['step', 'step_name'], optional: ['booking_id'] },
  status: 'active',
});

ev({
  name: 'booking_list_view',
  category: 'booking',
  version: 1,
  description: 'User views their booking list',
  businessObjective: 'Track booking list view frequency',
  kpi: 'Booking List View Count',
  owner: 'booking',
  properties: { required: ['result_count'], optional: [] },
  status: 'active',
});

ev({
  name: 'booking_confirm',
  category: 'booking',
  version: 1,
  description: 'Admin confirms a booking',
  businessObjective: 'Measure booking confirmation rate',
  kpi: 'Confirmation Rate > 80%',
  owner: 'booking',
  properties: { required: ['booking_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'booking_status_view',
  category: 'booking',
  version: 1,
  description: 'User views booking status',
  businessObjective: 'Track booking status checking behavior',
  kpi: 'Booking Status Check Rate',
  owner: 'booking',
  properties: { required: ['booking_id', 'status'], optional: [] },
  status: 'active',
});

ev({
  name: 'booking_assign',
  category: 'booking',
  version: 1,
  description: 'Admin assigns a partner to a booking',
  businessObjective: 'Track partner assignment rate and speed',
  kpi: 'Assignment Rate > 90%',
  owner: 'booking',
  properties: { required: ['booking_id', 'partner_id'], optional: [] },
  status: 'active',
});

ev({
  name: 'booking_cancel',
  category: 'booking',
  version: 1,
  description: 'Booking is cancelled by customer or admin',
  businessObjective: 'Track cancellation rate and reasons',
  kpi: 'Cancellation Rate < 10%',
  owner: 'booking',
  properties: { required: ['booking_id'], optional: ['reason'] },
  status: 'active',
});
