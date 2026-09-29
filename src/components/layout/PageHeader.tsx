import type { ReactNode } from "react";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-fg">{title}</h1>
      {action ? <div className="flex shrink-0">{action}</div> : null}
    </div>
  );
}
