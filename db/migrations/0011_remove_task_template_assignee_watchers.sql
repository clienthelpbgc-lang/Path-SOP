ALTER TABLE "task_templates" DROP CONSTRAINT "task_templates_default_assignee_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_templates" DROP COLUMN "default_assignee";--> statement-breakpoint
ALTER TABLE "task_templates" DROP COLUMN "default_watchers";