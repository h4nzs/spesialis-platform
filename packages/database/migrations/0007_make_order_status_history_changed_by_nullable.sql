-- Make changed_by nullable in order_status_history to support guest bookings
ALTER TABLE "order_status_history" ALTER COLUMN "changed_by" DROP NOT NULL;
