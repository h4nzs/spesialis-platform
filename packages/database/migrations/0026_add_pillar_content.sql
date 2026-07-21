ALTER TABLE "articles" ADD COLUMN "is_pillar_content" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE INDEX "idx_articles_is_pillar_content" ON "articles" USING btree ("is_pillar_content");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "article_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_article_id" uuid NOT NULL,
	"target_article_id" uuid NOT NULL,
	"link_type" varchar(20) DEFAULT 'internal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_links" ADD CONSTRAINT "article_links_source_article_id_articles_id_fk" FOREIGN KEY ("source_article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "article_links" ADD CONSTRAINT "article_links_target_article_id_articles_id_fk" FOREIGN KEY ("target_article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_article_links_source" ON "article_links" USING btree ("source_article_id");
--> statement-breakpoint
CREATE INDEX "idx_article_links_target" ON "article_links" USING btree ("target_article_id");
--> statement-breakpoint
ALTER TABLE "article_links" ADD CONSTRAINT "uq_article_links_source_target" UNIQUE ("source_article_id", "target_article_id");
