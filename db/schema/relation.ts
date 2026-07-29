import { relations } from "drizzle-orm";

import { companies } from "@/features/company/schema";
import { dailyTasks } from "@/features/daily-task/schema";
import { users } from "@/features/user/schema";

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  dailyTasks: many(dailyTasks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  assignedTasks: many(dailyTasks, { relationName: "assignedTo" }),
  createdTasks: many(dailyTasks, { relationName: "assignedBy" }),
}));

export const dailyTasksRelations = relations(dailyTasks, ({ one }) => ({
  company: one(companies, {
    fields: [dailyTasks.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [dailyTasks.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  assigner: one(users, {
    fields: [dailyTasks.assignedBy],
    references: [users.id],
    relationName: "assignedBy",
  }),
}));
