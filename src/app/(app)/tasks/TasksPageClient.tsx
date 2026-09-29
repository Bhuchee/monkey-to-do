"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { ApiError, deleteTask, type Task } from "@/lib/api-client";

export function TasksPageClient() {
  const { tasks, isLoading, error, mutate } = useTasks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditingTask(undefined);
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

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Tasks"
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        mutate={mutate}
        onEdit={openEdit}
        onRequestDelete={setDeleteTarget}
        onCreate={openCreate}
      />

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} onSaved={handleSaved} />

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
    </div>
  );
}
