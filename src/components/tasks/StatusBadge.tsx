import { Circle, CircleCheck, CircleDot } from "lucide-react";

import { Chip } from "@/components/tasks/Chip";
import type { TaskStatus } from "@/lib/api-client";

const config = {
  todo: { icon: Circle, label: "To do", color: "neutral" },
  in_progress: { icon: CircleDot, label: "In progress", color: "info" },
  done: { icon: CircleCheck, label: "Done", color: "success" },
} as const;

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { icon, label, color } = config[status];
  return <Chip icon={icon} label={label} color={color} />;
}
