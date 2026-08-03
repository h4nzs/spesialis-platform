-- Fix is_active columns: convert varchar(20) DEFAULT 'true' → boolean DEFAULT true.
-- Four tables were created with is_active as a varchar column storing 'true'/'false' strings
-- instead of a proper boolean type, causing type-inconsistency bugs.

ALTER TABLE faq ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE coverage_areas ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE cms_testimonials ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE blog_ads ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
