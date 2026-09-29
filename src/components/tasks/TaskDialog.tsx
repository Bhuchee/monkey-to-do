"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTask,
  updateTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api-client";
import { taskCreateSchema } from "@/lib/validation/tasks";

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

function emptyForm(defaultStatus?: TaskStatus): FormState {
  return {
    title: "",
    description: "",
    status: defaultStatus ?? "todo",
    priority: "medium",
    dueDate: "",
  };
}

function formFromTask(task: Task): FormState {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
  };
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultStatus?: TaskStatus;
  onSaved: (task: Task) => void;
}) {
  const isEdit = task !== undefined;
  const [form, setForm] = useState<FormState>(() => (task ? formFromTask(task) : emptyForm(defaultStatus)));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(task ? formFromTask(task) : emptyForm(defaultStatus));
      setTitleError(null);
      setServerError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    const trimmedTitle = form.title.trim();
    if (trimmedTitle.length === 0) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(null);

    const payload = {
      title: trimmedTitle,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate === "" ? null : form.dueDate,
    };

    const parsed = taskCreateSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Please check the form and try again.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const changed: Record<string, unknown> = {};
        if (payload.title !== task.title) changed.title = payload.title;
        if (payload.description !== task.description) changed.description = payload.description;
        if (payload.status !== task.status) changed.status = payload.status;
        if (payload.priority !== task.priority) changed.priority = payload.priority;
        if (payload.dueDate !== task.dueDate) changed.dueDate = payload.dueDate;

        if (Object.keys(changed).length === 0) {
          onOpenChange(false);
          return;
        }

        const saved = await updateTask(task.id, changed);
        onSaved(saved);
        toast.success("Task updated");
      } else {
        const saved = await createTask(payload);
        onSaved(saved);
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Couldn't save the task. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="task-title" className="text-sm font-medium text-fg">
                Title <span className="text-fg-muted">*</span>
              </label>
              <Input
                id="task-title"
                autoFocus
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
                aria-invalid={titleError ? true : undefined}
                aria-describedby={titleError ? "task-title-error" : undefined}
              />
              {titleError ? (
                <p id="task-title-error" className="text-xs text-danger">
                  {titleError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="task-description" className="text-sm font-medium text-fg">
                Description
              </label>
              <Textarea
                id="task-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Add details (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-fg">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((f) => ({ ...f, status: value as TaskStatus }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-fg">Priority</label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm((f) => ({ ...f, priority: value as TaskPriority }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="task-due-date" className="text-sm font-medium text-fg">
                Due date
              </label>
              <Input
                id="task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            {serverError ? <p className="text-xs text-danger">{serverError}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
