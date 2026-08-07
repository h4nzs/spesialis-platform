CREATE TABLE "a2a_push_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" varchar(64) NOT NULL,
	"task_id" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"token" text,
	"authentication" jsonb,
	"tenant" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "a2a_push_configs_config_id_unique" UNIQUE("config_id"),
	CONSTRAINT "a2a_push_configs_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "a2a_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar(64) NOT NULL,
	"context_id" varchar(64) NOT NULL,
	"status" varchar(32) NOT NULL,
	"task" jsonb NOT NULL,
	"user_id" uuid,
	"tenant" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "a2a_tasks_task_id_unique" UNIQUE("task_id")
);
