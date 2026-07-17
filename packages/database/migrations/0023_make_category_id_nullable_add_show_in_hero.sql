ALTER TABLE "services" DROP CONSTRAINT "services_category_id_service_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "show_in_hero" boolean DEFAULT false NOT NULL;
