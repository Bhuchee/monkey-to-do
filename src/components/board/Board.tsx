"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus, SquareKanban } from "lucide-react";
import { toast } from "sonner";

import { BoardColumn } from "@/components/board/BoardColumn";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import { ApiError, deleteTask, updateTask, type Task, type TaskStatus } from "@/lib/api-client";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const PRIORITY_RANK: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };

function sortForBoard(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
}

export function Board() {
  const { tasks, isLoading, error, mutate } = useTasks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  async function moveTask(task: Task, nextStatus: TaskStatus) {
    if (task.status === nextStatus) return;
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
      toast.error("Couldn't move task. Try again.");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !tasks) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    const nextStatus = over.id;
    if (typeof nextStatus !== "string" || !STATUSES.includes(nextStatus as TaskStatus)) return;
    void moveTask(task, nextStatus as TaskStatus);
  }

  function openCreate(status: TaskStatus) {
    setEditingTask(undefined);
    setDefaultStatus(status);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleSaved(saved: Task) {
    mutate(
      (current) => {
        if (!current) return current;
        const exists = current.some((t) => t.id === saved.id);
        return exists ? current.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...current];
      },
      { revalidate: true },
    );
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    try {
      await deleteTask(target.id);
      mutate((current) => current?.filter((t) => t.id !== target.id), { revalidate: false });
      toast.success("Task deleted");
      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error("Task not found");
        mutate();
        setDeleteTarget(null);
      } else {
        toast.error("Couldn't delete task. Try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <div key={status} className="flex min-w-[300px] flex-1 flex-col gap-2 rounded-lg bg-surface p-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Couldn't load your tasks." onRetry={() => mutate()} />;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={SquareKanban}
        title="No tasks yet"
        description="Add your first task to get started."
        action={
          <Button onClick={() => openCreate("todo")}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />
    );
  }

  const columns = STATUSES.map((status) => ({
    status,
    tasks: sortForBoard(tasks.filter((t) => t.status === status)),
  }));

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:snap-none">
          {columns.map(({ status, tasks: columnTasks }) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={columnTasks}
              onAddTask={openCreate}
              onEdit={openEdit}
              onRequestDelete={setDeleteTarget}
              onMoveTo={moveTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this task?"
        description="This can't be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
