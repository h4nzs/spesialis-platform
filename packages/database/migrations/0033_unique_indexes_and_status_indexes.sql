-- Add unique indexes and status-column indexes for critical lookup performance.

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_skills_partner_category
  ON partner_skills (partner_id, category_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_seo_metadata_entity
  ON seo_metadata (entity_type, entity_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_profiles_phone
  ON partner_profiles (phone)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_email
  ON companies (email)
  WHERE deleted_at IS NULL;

-- Status column indexes (most frequently filtered columns in dashboards)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_verification_status ON partner_profiles (verification_status);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_availability ON partner_profiles (availability);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
