-- Add soft-delete (deleted_at) columns to critical tables that are
-- currently missing them. This enables recovery of accidentally deleted
-- records and compliance with auditable-deletion requirements.

-- Financial & operational records (most critical)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE order_status_history ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE partner_documents ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- Supporting tables
ALTER TABLE partner_skills ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE media ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE order_media ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE article_categories ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE company_users ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE redirects ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE page_errors ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE indexnow_logs ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE coverage_areas ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE service_suggestions ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE article_links ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE resource_locks ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE blog_ads ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- Make sure company_users and branches have their basic timestamps too
ALTER TABLE company_users ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE company_users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
ALTER TABLE branches ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
