export type BulkDeleteTasksResult = {
  deletedIds: string[];
  // Requested tasks that weren't deleted: not found, not created by the
  // caller, or no longer pending (e.g. started since the list was loaded).
  skippedCount: number;
};
