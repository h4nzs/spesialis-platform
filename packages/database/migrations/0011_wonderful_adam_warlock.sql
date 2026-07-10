ALTER TABLE "articles" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_title" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_description" varchar(320);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "og_title" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "og_description" varchar(500);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "og_image" varchar(500);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "canonical_url" varchar(500);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "robots" varchar(100) DEFAULT 'index, follow' NOT NULL;