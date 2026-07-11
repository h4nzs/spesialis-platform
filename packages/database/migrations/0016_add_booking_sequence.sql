-- ── Booking Number Sequence ─────────────────────────────────────────
-- Replaces the non-atomic MAX()+1 approach in the booking creation code.
-- Using nextval('booking_number_seq') ensures every concurrent request
-- gets a unique, monotonically increasing value.
--
-- The format is: SP-YYYY-{NNNNNN} where NNNNNN comes from this sequence.
--
-- On existing databases with real orders, run the following AFTER migration:
--   SELECT setval('booking_number_seq', COALESCE(
--     (SELECT MAX(CAST(SUBSTRING(booking_number, 9) AS INTEGER)) FROM orders
--      WHERE booking_number LIKE 'SP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'),
--     0
--   ));
-- This ensures new numbers pick up after existing data without conflicts.

CREATE SEQUENCE IF NOT EXISTS booking_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
