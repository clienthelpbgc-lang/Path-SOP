// The assignee is always notified about their own task, so also keeping them
// as a watcher would only duplicate notifications. Applied whenever the
// assignee changes (e.g. "Assign to me" after adding yourself as a watcher).
export function excludeAssigneeFromWatchers(
  watcherIds: string[],
  assigneeId: string,
): string[] {
  return assigneeId
    ? watcherIds.filter((watcherId) => watcherId !== assigneeId)
    : watcherIds;
}
