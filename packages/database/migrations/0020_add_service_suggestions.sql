CREATE TABLE IF NOT EXISTS "service_suggestions" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "partner_name" varchar(255) NOT NULL,
  "partner_email" varchar(255) NOT NULL,
  "service_name" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
