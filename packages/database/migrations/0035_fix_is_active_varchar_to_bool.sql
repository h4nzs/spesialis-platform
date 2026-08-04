-- Fix is_active columns: convert varchar(20) DEFAULT 'true' → boolean DEFAULT true.
-- Four tables were created with is_active as a varchar column storing 'true'/'false' strings
-- instead of a proper boolean type, causing type-inconsistency bugs.

-- PostgreSQL does not automatically cast the existing varchar default while
-- changing the column type, so remove it before the conversion and restore
-- the boolean default afterwards.
ALTER TABLE faq ALTER COLUMN is_active DROP DEFAULT;
ALTER TABLE coverage_areas ALTER COLUMN is_active DROP DEFAULT;
ALTER TABLE cms_testimonials ALTER COLUMN is_active DROP DEFAULT;
ALTER TABLE blog_ads ALTER COLUMN is_active DROP DEFAULT;

ALTER TABLE faq ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE coverage_areas ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE cms_testimonials ALTER COLUMN is_active TYPE boolean USING is_active = 'true';
ALTER TABLE blog_ads ALTER COLUMN is_active TYPE boolean USING is_active = 'true';

ALTER TABLE faq ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE coverage_areas ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE cms_testimonials ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE blog_ads ALTER COLUMN is_active SET DEFAULT true;
