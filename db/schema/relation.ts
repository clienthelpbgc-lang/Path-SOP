import { relations } from "drizzle-orm";

import { companies } from "@/features/company/schema";
import { kraTemplatePresets, kraTemplates, kras } from "@/features/kra/schema";
import { platformAdmins } from "@/features/platform-admin/schema";
import {
  taskAttachments,
  taskChecklistItems,
  taskReminders,
  taskTemplatePresets,
  taskTemplates,
  taskWatchers,
  tasks,
} from "@/features/task/schema";
import { users } from "@/features/user/schema";

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  tasks: many(tasks),
  taskTemplates: many(taskTemplates),
  kras: many(kras),
  kraTemplates: many(kraTemplates),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  assignedTasks: many(tasks, { relationName: "taskAssignee" }),
  createdTasks: many(tasks, { relationName: "taskCreator" }),
  assignedKras: many(kras, { relationName: "kraAssignee" }),
  assignedByKras: many(kras, { relationName: "kraAssigner" }),
}));

export const krasRelations = relations(kras, ({ one }) => ({
  company: one(companies, {
    fields: [kras.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [kras.assignedTo],
    references: [users.id],
    relationName: "kraAssignee",
  }),
  assigner: one(users, {
    fields: [kras.assignedBy],
    references: [users.id],
    relationName: "kraAssigner",
  }),
  template: one(kraTemplates, {
    fields: [kras.templateId],
    references: [kraTemplates.id],
    relationName: "kraFromTemplate",
  }),
  sourceOfTemplate: one(kraTemplates, {
    fields: [kras.id],
    references: [kraTemplates.sourceKraId],
    relationName: "kraTemplateSourceKra",
  }),
}));

export const kraTemplatesRelations = relations(kraTemplates, ({ one }) => ({
  company: one(companies, {
    fields: [kraTemplates.companyId],
    references: [companies.id],
  }),
  sourceKra: one(kras, {
    fields: [kraTemplates.sourceKraId],
    references: [kras.id],
    relationName: "kraTemplateSourceKra",
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "taskAssignee",
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "taskCreator",
  }),
  template: one(taskTemplates, {
    fields: [tasks.templateId],
    references: [taskTemplates.id],
    relationName: "taskFromTemplate",
  }),
  seriesParent: one(tasks, {
    fields: [tasks.seriesParentId],
    references: [tasks.id],
    relationName: "taskSeries",
  }),
  occurrences: many(tasks, { relationName: "taskSeries" }),
  checklistItems: many(taskChecklistItems),
  attachments: many(taskAttachments),
  reminders: many(taskReminders),
  watchers: many(taskWatchers),
  sourceOfTemplate: one(taskTemplates, {
    fields: [tasks.id],
    references: [taskTemplates.sourceTaskId],
    relationName: "templateSourceTask",
  }),
}));

export const taskTemplatesRelations = relations(taskTemplates, ({ one }) => ({
  company: one(companies, {
    fields: [taskTemplates.companyId],
    references: [companies.id],
  }),
  sourceTask: one(tasks, {
    fields: [taskTemplates.sourceTaskId],
    references: [tasks.id],
    relationName: "templateSourceTask",
  }),
}));

export const taskTemplatePresetsRelations = relations(
  taskTemplatePresets,
  ({ one }) => ({
    creator: one(platformAdmins, {
      fields: [taskTemplatePresets.createdBy],
      references: [platformAdmins.id],
    }),
  }),
);

export const kraTemplatePresetsRelations = relations(
  kraTemplatePresets,
  ({ one }) => ({
    creator: one(platformAdmins, {
      fields: [kraTemplatePresets.createdBy],
      references: [platformAdmins.id],
    }),
  }),
);

export const taskChecklistItemsRelations = relations(
  taskChecklistItems,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskChecklistItems.taskId],
      references: [tasks.id],
    }),
    doneByUser: one(users, {
      fields: [taskChecklistItems.doneBy],
      references: [users.id],
    }),
  }),
);

export const taskAttachmentsRelations = relations(
  taskAttachments,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskAttachments.taskId],
      references: [tasks.id],
    }),
    uploadedByUser: one(users, {
      fields: [taskAttachments.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const taskRemindersRelations = relations(taskReminders, ({ one }) => ({
  task: one(tasks, {
    fields: [taskReminders.taskId],
    references: [tasks.id],
  }),
}));

export const taskWatchersRelations = relations(taskWatchers, ({ one }) => ({
  task: one(tasks, {
    fields: [taskWatchers.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskWatchers.userId],
    references: [users.id],
  }),
}));
