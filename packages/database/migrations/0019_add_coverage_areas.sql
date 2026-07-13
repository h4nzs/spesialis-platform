CREATE TABLE IF NOT EXISTS "coverage_areas" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "city" varchar(100) NOT NULL,
  "note" text,
  "display_order" integer NOT NULL DEFAULT 0,
  "is_active" varchar(20) NOT NULL DEFAULT 'true',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
