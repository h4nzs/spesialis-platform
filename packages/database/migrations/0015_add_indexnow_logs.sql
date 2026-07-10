CREATE TABLE IF NOT EXISTS indexnow_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url         text NOT NULL,
  status      varchar(20) NOT NULL DEFAULT 'pending',
  http_status integer,
  error       text,
  duration    integer,
  key_used    varchar(100),
  destination varchar(50) NOT NULL DEFAULT 'indexnow',
  created_at  timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_indexnow_logs_created_at ON indexnow_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_indexnow_logs_status ON indexnow_logs (status);
CREATE INDEX IF NOT EXISTS idx_indexnow_logs_url ON indexnow_logs (url);
