import { SubtaskStatus, TaskPriority, TaskStatus } from "@/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: "Belum Dikerjakan",
  "In Progress": "Sedang Dikerjakan",
  Done: "Selesai",
};

export const SUBTASK_STATUS_LABELS: Record<SubtaskStatus, string> = {
  Todo: "Belum Dikerjakan",
  Done: "Selesai",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
};

export const SECTION_LABELS = {
  upcomingDeadlines: "Tenggat Terdekat",
  subtaskProgress: "Progres Subtugas",
} as const;

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getSubtaskStatusLabel(status: SubtaskStatus): string {
  return SUBTASK_STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function formatRelativeDays(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return `Terlambat ${Math.abs(daysRemaining)} hari`;
  }
  if (daysRemaining === 0) {
    return "Hari ini";
  }
  if (daysRemaining === 1) {
    return "Besok";
  }
  return `${daysRemaining} hari lagi`;
}

export function computeDaysRemaining(deadlineIso: string): number {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  const d = new Date(deadlineIso);
  const deadlineMidnight = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).getTime();
  return Math.ceil((deadlineMidnight - startOfToday) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

