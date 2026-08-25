CREATE TYPE "public"."kra_status" AS ENUM('assigned', 'completed', 'not_completed');--> statement-breakpoint
CREATE TYPE "public"."kra_type" AS ENUM('monthly', 'weekly');--> statement-breakpoint
CREATE TABLE "kras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "kra_status" DEFAULT 'assigned' NOT NULL,
	"type" "kra_type" NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"repeat" boolean DEFAULT false NOT NULL,
	"assigned_to" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"weightage" integer DEFAULT 1 NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kras_weightage_range_check" CHECK ("kras"."weightage" >= 1 AND "kras"."weightage" <= 10)
);
--> statement-breakpoint
ALTER TABLE "kras" ADD CONSTRAINT "kras_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kras" ADD CONSTRAINT "kras_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kras" ADD CONSTRAINT "kras_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kras_company_id_status_idx" ON "kras" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "kras_assigned_to_status_idx" ON "kras" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "kras_type_idx" ON "kras" USING btree ("type");--> statement-breakpoint
CREATE INDEX "kras_period_start_period_end_idx" ON "kras" USING btree ("period_start","period_end");