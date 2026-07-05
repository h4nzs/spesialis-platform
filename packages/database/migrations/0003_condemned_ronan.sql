CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar(500) NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" varchar(20) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_addresses_customer_id" ON "addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_articles_category_id" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_order_id" ON "assignments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_partner_id" ON "assignments" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_branches_company_id" ON "branches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_company_users_company_id" ON "company_users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_company_users_user_id" ON "company_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_order_id" ON "complaints" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_customer_id" ON "complaints" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_resolved_by" ON "complaints" USING btree ("resolved_by");--> statement-breakpoint
CREATE INDEX "idx_contracts_company_id" ON "contracts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_customer_profiles_user_id" ON "customer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_company_id" ON "invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_order_id" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_media_uploaded_by" ON "media" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_service_id" ON "order_items" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_order_media_order_id" ON "order_media" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_media_media_id" ON "order_media" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order_id" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_changed_by" ON "order_status_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_id" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_company_id" ON "orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_orders_address_id" ON "orders" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "idx_orders_partner_id" ON "orders" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_documents_partner_id" ON "partner_documents" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_profiles_user_id" ON "partner_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_partner_skills_partner_id" ON "partner_skills" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_skills_category_id" ON "partner_skills" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_id" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_verified_by" ON "payments" USING btree ("verified_by");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_order_id" ON "reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_customer_id" ON "reviews" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_partner_id" ON "reviews" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_services_category_id" ON "services" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_system_settings_updated_by" ON "system_settings" USING btree ("updated_by");