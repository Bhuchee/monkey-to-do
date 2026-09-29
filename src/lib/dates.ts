import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isSameDay,
  isSameYear,
  parseISO,
} from "date-fns";

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

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const minutes = differenceInMinutes(now, date);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (isSameDay(date, now)) return `${Math.floor(minutes / 60)} hr ago`;
  if (differenceInCalendarDays(now, date) === 1) return "Yesterday";

  return isSameYear(date, now) ? format(date, "d MMM") : format(date, "d MMM yyyy");
}
