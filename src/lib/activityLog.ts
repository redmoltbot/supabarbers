import type { ActivityLog } from "@/types";

const KEY = "supaclaw_activity_log";
const MAX_ENTRIES = 15;

export function getLog(): ActivityLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addLogEntry(
  entry: Omit<ActivityLog, "id" | "timestamp">
): void {
  const log = getLog();
  const newEntry: ActivityLog = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...log].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
}
