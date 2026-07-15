-- Change services.base_price from numeric(12,2) to text
-- so admin can input any text like "Rp 150.000" or "Hubungi Kami"

ALTER TABLE "services" ALTER COLUMN "base_price" TYPE text;
