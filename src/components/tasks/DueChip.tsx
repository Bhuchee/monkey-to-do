"use client";

import { Calendar, CalendarClock, CircleAlert } from "lucide-react";

import { Chip } from "@/components/tasks/Chip";
import type { TaskStatus } from "@/lib/api-client";
import { formatDue, isOverdue, localToday } from "@/lib/dates";

export function DueChip({ dueDate, status }: { dueDate: string | null; status: TaskStatus }) {
  if (!dueDate) return null;

  const today = localToday();

  if (isOverdue(dueDate, status, today)) {
    return <Chip icon={CircleAlert} label="Overdue" color="danger" />;
  }
  if (dueDate === today) {
    return <Chip icon={CalendarClock} label="Today" color="warning" />;
  }
  return <Chip icon={Calendar} label={formatDue(dueDate, today)} color="muted" />;
}
