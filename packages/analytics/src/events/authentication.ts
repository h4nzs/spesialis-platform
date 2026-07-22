import { ev } from './_helpers.ts';

// ── Authentication Events ─────────────────────────────────────────
ev({
  name: 'login_start',
  category: 'authentication',
  version: 1,
  description: 'User starts login process',
  businessObjective: 'Track login initiation',
  kpi: 'Login Completion Rate > 80%',
  owner: 'auth',
  properties: { required: ['method'], optional: [] },
  status: 'active',
});

ev({
  name: 'login_success',
  category: 'authentication',
  version: 1,
  description: 'User successfully logged in',
  businessObjective: 'Track user retention and engagement',
  kpi: 'Login Rate / MAU',
  owner: 'auth',
  properties: { required: ['user_id', 'role'], optional: [] },
  status: 'active',
});

ev({
  name: 'login_failed',
  category: 'authentication',
  version: 1,
  description: 'Login attempt failed',
  businessObjective: 'Track login failure rate and diagnose issues',
  kpi: 'Login Failure Rate < 10%',
  owner: 'auth',
  properties: { required: ['reason'], optional: [] },
  status: 'active',
});

ev({
  name: 'logout',
  category: 'authentication',
  version: 1,
  description: 'User logs out',
  businessObjective: 'Track user sessions and logout behavior',
  kpi: 'Session Duration vs Logout',
  owner: 'auth',
  properties: { required: [], optional: [] },
  status: 'active',
});

ev({
  name: 'password_reset_request',
  category: 'authentication',
  version: 1,
  description: 'User requests a password reset',
  businessObjective: 'Track password recovery usage',
  kpi: 'Password Reset Rate',
  owner: 'auth',
  properties: { required: ['email_hash'], optional: [] },
  status: 'active',
});

ev({
  name: 'password_reset_complete',
  category: 'authentication',
  version: 1,
  description: 'User successfully resets their password',
  businessObjective: 'Track password reset completion rate',
  kpi: 'Password Reset Success Rate > 70%',
  owner: 'auth',
  properties: { required: [], optional: [] },
  status: 'active',
});

ev({
  name: 'register_start',
  category: 'authentication',
  version: 1,
  description: 'User starts registration',
  businessObjective: 'Track registration initiation',
  kpi: 'Registration Completion Rate > 70%',
  owner: 'auth',
  properties: { required: ['method'], optional: [] },
  funnel: 'authentication',
  status: 'active',
});

ev({
  name: 'register_complete',
  category: 'authentication',
  version: 1,
  description: 'User completes registration',
  businessObjective: 'Track successful user acquisition',
  kpi: 'Registration Conversion Rate',
  owner: 'auth',
  properties: { required: ['user_id', 'role'], optional: [] },
  status: 'active',
});
