CREATE TABLE "kra_template_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "kra_type" NOT NULL,
	"weightage" integer DEFAULT 1 NOT NULL,
	"remarks" text,
	"repeat" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_template_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"weightage" integer DEFAULT 0 NOT NULL,
	"checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reminders" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_repeating" boolean DEFAULT false NOT NULL,
	"repeat_unit" "repeat_unit",
	"repeat_interval" integer,
	"repeat_days_of_week" smallint[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kra_template_presets" ADD CONSTRAINT "kra_template_presets_created_by_platform_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."platform_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_template_presets" ADD CONSTRAINT "task_template_presets_created_by_platform_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."platform_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kra_template_presets_is_active_idx" ON "kra_template_presets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_template_presets_is_active_idx" ON "task_template_presets" USING btree ("is_active");--> statement-breakpoint

-- Presets are global, read-only from the tenant role's perspective: every
-- company must be able to SELECT every preset, but only systemDb (the
-- platform-admin path, connected as the privileged/owner role) may write
-- them. Unlike every tenant_isolation policy in 0007_enable_rls.sql, this
-- is not keyed off current_company_id() at all -- USING (true) is correct
-- here because there is no per-row tenant to isolate by (neither table has
-- a company_id column).
GRANT SELECT ON task_template_presets, kra_template_presets TO app_tenant;--> statement-breakpoint

ALTER TABLE task_template_presets ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY read_all ON task_template_presets FOR SELECT
  TO app_tenant
  USING (true);--> statement-breakpoint

ALTER TABLE kra_template_presets ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY read_all ON kra_template_presets FOR SELECT
  TO app_tenant
  USING (true);