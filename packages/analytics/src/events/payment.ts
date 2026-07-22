import { ev } from './_helpers.ts';

// ── Payment Events ────────────────────────────────────────────────
ev({
  name: 'payment_submit',
  category: 'payment',
  version: 1,
  description: 'Customer submits payment for processing',
  businessObjective: 'Track payment submission rate',
  kpi: 'Payment Submission Rate',
  owner: 'finance',
  properties: { required: ['booking_id', 'amount', 'method'], optional: [] },
  status: 'active',
});

ev({
  name: 'payment_start',
  category: 'payment',
  version: 1,
  description: 'Customer initiates payment',
  businessObjective: 'Track payment initiation rate',
  kpi: 'Payment Completion Rate > 90%',
  owner: 'finance',
  properties: { required: ['booking_id', 'amount', 'method'], optional: [] },
  status: 'active',
});

ev({
  name: 'payment_success',
  category: 'payment',
  version: 1,
  description: 'Payment completed successfully',
  businessObjective: 'Track successful payment completions',
  kpi: 'Payment Success Rate > 90%',
  owner: 'finance',
  properties: { required: ['booking_id', 'amount', 'method', 'payment_id'], optional: [] },
  goals: ['payment_completed'],
  status: 'active',
});

ev({
  name: 'payment_failed',
  category: 'payment',
  version: 1,
  description: 'Payment failed',
  businessObjective: 'Track payment failures and diagnose issues',
  kpi: 'Payment Failure Rate < 10%',
  owner: 'finance',
  properties: { required: ['booking_id', 'amount', 'method'], optional: ['error'] },
  status: 'active',
});
