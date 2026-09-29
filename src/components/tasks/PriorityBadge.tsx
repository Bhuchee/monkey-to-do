import { SignalHigh, SignalLow, SignalMedium } from "lucide-react";

import { Chip } from "@/components/tasks/Chip";
import type { TaskPriority } from "@/lib/api-client";

const config = {
  high: { icon: SignalHigh, label: "High", color: "danger" },
  medium: { icon: SignalMedium, label: "Medium", color: "warning" },
  low: { icon: SignalLow, label: "Low", color: "neutral" },
} as const;

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { icon, label, color } = config[priority];
  return <Chip icon={icon} label={label} color={color} />;
}
