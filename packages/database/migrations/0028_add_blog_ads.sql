CREATE TABLE "blog_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"caption" varchar(500),
	"link_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" varchar(20) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
