"use client";

import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
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

  function stopForMenu(e: PointerEvent | MouseEvent) {
    // The More menu sits inside the card's drag/click surface; stop these
    // events from reaching the card so opening the menu never starts a
    // drag or fires the card's own click-to-edit.
    e.stopPropagation();
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      onClick={() => onEdit(task)}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(task);
        }
      }}
      className={cn(
        "group cursor-grab touch-none select-none rounded-md border border-border bg-surface-raised p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
        isDragging && "z-10 opacity-90 ring-1 ring-brand",
      )}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical
          className="mt-0.5 size-4 shrink-0 text-fg-muted opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-hidden="true"
        />

        <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-fg">
          {task.title}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More actions"
                onPointerDown={stopForMenu}
                onClick={stopForMenu}
              />
            }
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={stopForMenu}>
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
