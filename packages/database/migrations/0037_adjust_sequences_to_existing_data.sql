-- Adjust invoice_number_seq and contract_number_seq starting values
-- to avoid collisions with existing data.
-- Sequences were created in 0036_invoice_contract_sequences.sql with START 1,
-- but existing records may already use those numbers.
-- This migration sets each sequence to MAX(existing) + 1 so new inserts
-- won't produce duplicate keys.

DO $$
DECLARE
  max_inv BIGINT;
  max_ct  BIGINT;
BEGIN
  SELECT COALESCE(
    MAX(
      NULLIF(
        regexp_replace(invoice_number, '^INV-\d{4}-', '', 'g'),
        ''
      )::bigint
    ),
    0
  )
    INTO max_inv
    FROM invoices;

  PERFORM setval('invoice_number_seq', max_inv + 1, false);

  SELECT COALESCE(
    MAX(
      NULLIF(
        regexp_replace(contract_number, '^CT-\d{4}-', '', 'g'),
        ''
      )::bigint
    ),
    0
  )
    INTO max_ct
    FROM contracts;

  PERFORM setval('contract_number_seq', max_ct + 1, false);
END $$;
