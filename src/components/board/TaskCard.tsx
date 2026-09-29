"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRightLeft, Ellipsis, GripVertical, Pencil, Trash2 } from "lucide-react";

import { DueChip } from "@/components/tasks/DueChip";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskStatus } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function TaskCard({
  task,
  onEdit,
  onRequestDelete,
  onMoveTo,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onMoveTo: (task: Task, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "group rounded-md border border-border bg-surface-raised p-3",
        isDragging && "z-10 opacity-90 ring-1 ring-brand",
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label="Drag to move"
          className="mt-0.5 cursor-grab touch-none text-fg-muted opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-left text-sm font-medium text-fg"
        >
          <span className="line-clamp-2">{task.title}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}>
            <Ellipsis className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRightLeft className="size-4" aria-hidden="true" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(Object.keys(STATUS_LABELS) as TaskStatus[])
                  .filter((status) => status !== task.status)
                  .map((status) => (
                    <DropdownMenuItem key={status} onClick={() => onMoveTo(task, status)}>
                      {STATUS_LABELS[status]}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem variant="destructive" onClick={() => onRequestDelete(task)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[22px]">
        <PriorityBadge priority={task.priority} />
        <DueChip dueDate={task.dueDate} status={task.status} />
      </div>
    </div>
  );
}
