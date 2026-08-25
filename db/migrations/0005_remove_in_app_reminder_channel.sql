ALTER TABLE "task_reminders" ALTER COLUMN "channel" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."reminder_channel";--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('whatsapp', 'email');--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "channel" SET DATA TYPE "public"."reminder_channel" USING "channel"::"public"."reminder_channel";