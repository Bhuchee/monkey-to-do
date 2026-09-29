import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const colorClasses = {
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning/12 text-warning",
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  neutral: "bg-neutral/12 text-neutral",
  muted: "bg-surface-raised text-fg-muted",
} as const;

export function Chip({
  icon: Icon,
  label,
  color,
}: {
  icon: LucideIcon;
  label: string;
  color: keyof typeof colorClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-sm px-2 text-xs font-medium",
        colorClasses[color],
      )}
    >
      <Icon className="size-3" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  );
}
