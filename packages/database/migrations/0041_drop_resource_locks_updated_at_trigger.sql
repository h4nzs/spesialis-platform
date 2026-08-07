-- resource_locks dibuat di migration 0027 tanpa kolom updated_at (menggunakan
-- heartbeat_at), tetapi migration 0030 secara keliru memasang trigger
-- trg_resource_locks_updated_at yang menulis NEW.updated_at. Akibatnya setiap
-- UPDATE (heartbeat lock, refresh lock) gagal dengan
-- 'record "new" has no field "updated_at"'.
DROP TRIGGER IF EXISTS trg_resource_locks_updated_at ON resource_locks;
