CREATE TABLE "cms_testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"location" varchar(200),
	"role" varchar(200),
	"quote" text NOT NULL,
	"rating" numeric(2, 1) DEFAULT '5' NOT NULL,
	"avatar" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" varchar(20) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coverage_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(100) NOT NULL,
	"note" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" varchar(20) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_name" varchar(255) NOT NULL,
	"partner_email" varchar(255) NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "homepage_sections" CASCADE;
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_category_id_service_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;
