CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path varchar(500) NOT NULL UNIQUE,
  target_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  hit_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX idx_redirects_source_path ON redirects (source_path);
CREATE INDEX idx_redirects_active ON redirects (is_active);
