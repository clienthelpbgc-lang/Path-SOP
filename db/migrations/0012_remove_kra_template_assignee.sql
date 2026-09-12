ALTER TABLE "kra_templates" DROP CONSTRAINT "kra_templates_default_assignee_users_id_fk";
--> statement-breakpoint
ALTER TABLE "kra_templates" DROP COLUMN "default_assignee";