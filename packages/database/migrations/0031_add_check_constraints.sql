-- Add CHECK constraints to enforce valid values at database level
-- for role, payment status, and order status columns.

-- users.role: ONLY 8 allowed roles
ALTER TABLE users
  ADD CONSTRAINT chk_users_role CHECK (
    role IN (
      'customer', 'partner', 'corporate',
      'admin', 'super_admin', 'dispatcher',
      'finance', 'content_manager'
    )
  );

-- users.status: 5 valid statuses
ALTER TABLE users
  ADD CONSTRAINT chk_users_status CHECK (
    status IN ('active', 'pending', 'blocked', 'suspended', 'deleted')
  );

-- payments.status
ALTER TABLE payments
  ADD CONSTRAINT chk_payments_status CHECK (
    status IN ('Waiting', 'Pending Verification', 'Paid', 'Failed', 'Refunded')
  );

-- orders.status: full 15-state lifecycle
ALTER TABLE orders
  ADD CONSTRAINT chk_orders_status CHECK (
    status IN (
      'Draft', 'Pending Confirmation', 'Confirmed',
      'Waiting Assignment', 'Partner Assigned', 'Partner Accepted',
      'On The Way', 'Working', 'Completed',
      'Waiting Payment', 'Paid', 'Closed',
      'Cancelled', 'Rejected', 'Expired'
    )
  );

-- partner_profiles.verification_status
ALTER TABLE partner_profiles
  ADD CONSTRAINT chk_partner_verification_status CHECK (
    verification_status IN ('Pending', 'Approved', 'Rejected')
  );

-- partner_profiles.availability
ALTER TABLE partner_profiles
  ADD CONSTRAINT chk_partner_availability CHECK (
    availability IN ('Available', 'Busy', 'Vacation', 'Offline')
  );

-- complaints.status
ALTER TABLE complaints
  ADD CONSTRAINT chk_complaints_status CHECK (
    status IN ('Open', 'Investigating', 'Resolved', 'Closed')
  );

-- assignments.status
ALTER TABLE assignments
  ADD CONSTRAINT chk_assignments_status CHECK (
    status IN ('Assigned', 'Accepted', 'Rejected', 'Completed')
  );

-- articles.status
ALTER TABLE articles
  ADD CONSTRAINT chk_articles_status CHECK (
    status IN ('Draft', 'Published', 'Archived')
  );
