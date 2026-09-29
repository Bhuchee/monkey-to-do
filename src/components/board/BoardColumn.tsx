"use client";

import { useDroppable } from "@dnd-kit/core";
import { Circle, CircleCheck, CircleDot, Plus, type LucideIcon } from "lucide-react";

import { TaskCard } from "@/components/board/TaskCard";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const COLUMN_CONFIG: Record<TaskStatus, { label: string; icon: LucideIcon }> = {
  todo: { label: "To do", icon: Circle },
  in_progress: { label: "In progress", icon: CircleDot },
  done: { label: "Done", icon: CircleCheck },
};

export function BoardColumn({
  status,
  tasks,
  onAddTask,
  onEdit,
  onRequestDelete,
  onMoveTo,
}: {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onMoveTo: (task: Task, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { label, icon: Icon } = COLUMN_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[300px] shrink-0 snap-start flex-col rounded-lg bg-surface p-3 md:flex-1",
        isOver && "border border-dashed border-brand bg-brand-soft",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-fg-muted" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-base font-semibold text-fg">{label}</span>
          <span className="text-xs text-fg-muted">{tasks.length}</span>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={`Add task to ${label}`} onClick={() => onAddTask(status)}>
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            onMoveTo={onMoveTo}
          />
        ))}
      </div>
    </div>
  );
}
