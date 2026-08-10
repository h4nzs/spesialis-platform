-- security_events: catatan keamanan app-level (failed login, 429, payload
-- anomali, enumerasi endpoint). Menyimpan data forensik untuk detection
-- rules dan alert. User id nullable — event anonim (belum login) tetap
-- direkam.
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(100) NOT NULL,
  user_id uuid REFERENCES users(id),
  ip_address inet,
  user_agent text,
  path text,
  severity smallint NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_ip_created
  ON security_events (ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type_created
  ON security_events (event_type, created_at);
