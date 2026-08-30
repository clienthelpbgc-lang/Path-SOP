// Small clock-skew allowance for the "start date can't be in the past"
// check on task creation. The create-task form actively refreshes an
// untouched `startAt` to the current time right before submit (see
// create-task-dialog.tsx), so this isn't meant to cover a stale form value
// -- it only absorbs the unavoidable gap between that refresh, the zod
// resolver re-checking `new Date()` a tick later, and network latency to
// the server's own `new Date()` check.
export const START_DATE_PAST_TOLERANCE_MS = 60 * 1000;
