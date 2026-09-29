"use client";

import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { KeyedMutator } from "swr";

import { DueChip } from "@/components/tasks/DueChip";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTask, type Task } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function TaskRow({
  task,
  mutate,
  onEdit,
  onRequestDelete,
}: {
  task: Task;
  mutate: KeyedMutator<Task[]>;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
}) {
  const done = task.status === "done";

  async function handleToggle() {
    const nextStatus = done ? "todo" : "done";
    const optimisticTask: Task = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === "done" ? new Date().toISOString() : null,
    };

    try {
      await mutate(
        async (current) => {
          const saved = await updateTask(task.id, { status: nextStatus });
          return current?.map((t) => (t.id === task.id ? saved : t));
        },
        {
          optimisticData: (current) =>
            (current ?? []).map((t) => (t.id === task.id ? optimisticTask : t)),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      );
    } catch {
      toast.error("Couldn't update task. Try again.");
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 hover:bg-surface-raised"
      role="listitem"
    >
      <Checkbox
        checked={done}
        onCheckedChange={handleToggle}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      />

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
      >
        <span
          className={cn(
            "truncate text-sm font-medium text-fg",
            done && "text-fg-muted line-through",
          )}
        >
          {task.title}
        </span>
        {task.description ? (
          <span className="w-full truncate text-sm text-fg-muted">{task.description}</span>
        ) : null}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <DueChip dueDate={task.dueDate} status={task.status} />
        <StatusBadge status={task.status} />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="More actions" />
          }
        >
          <Ellipsis className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onRequestDelete(task)}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
