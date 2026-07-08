CREATE TABLE "partner_penalties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"order_id" uuid,
	"type" varchar(30) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(30) DEFAULT 'Pending' NOT NULL,
	"imposed_by" uuid NOT NULL,
	"imposed_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"resolved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "partner_penalties" ADD CONSTRAINT "partner_penalties_partner_id_partner_profiles_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_penalties" ADD CONSTRAINT "partner_penalties_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_penalties" ADD CONSTRAINT "partner_penalties_imposed_by_users_id_fk" FOREIGN KEY ("imposed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_partner_penalties_partner_id" ON "partner_penalties" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_penalties_order_id" ON "partner_penalties" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_partner_penalties_status" ON "partner_penalties" USING btree ("status");