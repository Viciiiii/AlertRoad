// Formats a scan's created_at (ISO string from the backend) into a short,
// human-readable local date/time for display in the UI. Returns null if
// there's no timestamp (e.g. rows saved before this field existed) so
// callers can just skip rendering it.
export function formatScanTimestamp(createdAt) {
  if (!createdAt) return null;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}