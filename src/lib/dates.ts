import { format, isSameYear, parseISO } from "date-fns";

export function serverTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function localToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isOverdue(dueDate: string | null, status: string, today: string): boolean {
  return dueDate !== null && status !== "done" && dueDate < today;
}

export function formatDue(dueDate: string, today: string): string {
  const date = parseISO(dueDate);
  const todayDate = parseISO(today);
  return isSameYear(date, todayDate) ? format(date, "EEE d MMM") : format(date, "d MMM yyyy");
}
