-- Drop trg_media_updated_at from the media table.
--
-- Migration 0030 attached set_updated_at() to media via
-- `CREATE TRIGGER trg_media_updated_at BEFORE UPDATE ON media`,
-- but the media table has NO updated_at column. Every UPDATE on media
-- therefore fails with `record "new" has no field "updated_at"`, which
-- breaks the media soft-delete endpoint (DELETE /api/v1/media/:id) and
-- any future UPDATE. The trigger is dropped; media keeps its
-- created_at/deleted_at lifecycle without an updated_at column.
DROP TRIGGER IF EXISTS trg_media_updated_at ON media;
