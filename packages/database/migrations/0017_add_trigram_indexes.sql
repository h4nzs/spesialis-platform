-- Enable pg_trgm extension for trigram-based text search
-- Required for GIN indexes that accelerate ILIKE '%query%' patterns
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for ILIKE '%query%' searches
-- Without these, every search with a leading wildcard does a sequential scan

CREATE INDEX IF NOT EXISTS idx_orders_booking_number_trgm
  ON orders USING gin (booking_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_redirects_source_path_trgm
  ON redirects USING gin (source_path gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_redirects_target_path_trgm
  ON redirects USING gin (target_path gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_media_filename_trgm
  ON media USING gin (filename gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_page_errors_path_trgm
  ON page_errors USING gin (path gin_trgm_ops);
