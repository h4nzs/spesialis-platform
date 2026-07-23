CREATE TABLE "article_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_article_id" uuid NOT NULL,
	"target_article_id" uuid NOT NULL,
	"link_type" varchar(20) DEFAULT 'internal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_article_links_source_target" UNIQUE("source_article_id","target_article_id")
);
--> statement-breakpoint
CREATE TABLE "resource_locks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" uuid NOT NULL,
	"locked_by" uuid NOT NULL,
	"locked_at" timestamp DEFAULT now() NOT NULL,
	"heartbeat_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "is_pillar_content" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "article_links" ADD CONSTRAINT "article_links_source_article_id_articles_id_fk" FOREIGN KEY ("source_article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_links" ADD CONSTRAINT "article_links_target_article_id_articles_id_fk" FOREIGN KEY ("target_article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_locks" ADD CONSTRAINT "resource_locks_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_article_links_source" ON "article_links" USING btree ("source_article_id");--> statement-breakpoint
CREATE INDEX "idx_article_links_target" ON "article_links" USING btree ("target_article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_resource_locks_resource" ON "resource_locks" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_articles_is_pillar_content" ON "articles" USING btree ("is_pillar_content");