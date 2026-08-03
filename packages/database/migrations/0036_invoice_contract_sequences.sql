-- Add PostgreSQL sequences for invoice and contract numbers.
-- Replaces the racy MAX()+1 approach with atomic nextval() calls.

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 50;

CREATE SEQUENCE IF NOT EXISTS contract_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 50;
