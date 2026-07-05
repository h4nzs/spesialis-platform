CREATE TABLE "corporate_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"industry" varchar(255),
	"employee_count" integer,
	"notes" text,
	"status" varchar(30) DEFAULT 'Pending' NOT NULL,
	"handled_by" uuid,
	"handled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_corporate_inquiries_status" ON "corporate_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_corporate_inquiries_email" ON "corporate_inquiries" USING btree ("email");