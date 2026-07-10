CREATE TABLE IF NOT EXISTS page_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path varchar(500) NOT NULL UNIQUE,
  referer text,
  user_agent text,
  count integer NOT NULL DEFAULT 1,
  first_seen timestamp DEFAULT now() NOT NULL,
  last_seen timestamp DEFAULT now() NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX idx_page_errors_path ON page_errors (path);
CREATE INDEX idx_page_errors_last_seen ON page_errors (last_seen);
