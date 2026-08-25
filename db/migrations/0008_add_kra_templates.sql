CREATE TABLE "kra_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source_kra_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"type" "kra_type" NOT NULL,
	"weightage" integer DEFAULT 1 NOT NULL,
	"remarks" text,
	"repeat" boolean DEFAULT false NOT NULL,
	"default_assignee" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kras" ADD COLUMN "template_id" uuid;--> statement-breakpoint
ALTER TABLE "kra_templates" ADD CONSTRAINT "kra_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kra_templates" ADD CONSTRAINT "kra_templates_source_kra_id_kras_id_fk" FOREIGN KEY ("source_kra_id") REFERENCES "public"."kras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kra_templates" ADD CONSTRAINT "kra_templates_default_assignee_users_id_fk" FOREIGN KEY ("default_assignee") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kra_templates" ADD CONSTRAINT "kra_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kra_templates_company_id_is_active_idx" ON "kra_templates" USING btree ("company_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "kra_templates_source_kra_id_unique" ON "kra_templates" USING btree ("source_kra_id");--> statement-breakpoint
ALTER TABLE "kras" ADD CONSTRAINT "kras_template_id_kra_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."kra_templates"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- RLS, matching every other tenant table (see 0007_enable_rls.sql): this
-- table is new, so its grant + policy need to be established in the same
-- migration that creates it rather than left open until a follow-up.
GRANT SELECT, INSERT, UPDATE, DELETE ON kra_templates TO app_tenant;
--> statement-breakpoint

ALTER TABLE kra_templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON kra_templates FOR ALL
  USING (company_id = current_company_id())
  WITH CHECK (company_id = current_company_id());