"use client";

import { ListTodo, Plus, SearchX } from "lucide-react";
import type { KeyedMutator } from "swr";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TaskRow } from "@/components/tasks/TaskRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/lib/api-client";

export function TaskList({
  tasks,
  isLoading,
  error,
  mutate,
  onEdit,
  onRequestDelete,
  onCreate,
  hasActiveFilters,
  onClearFilters,
}: {
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<Task[]>;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onCreate: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Couldn't load your tasks." onRetry={() => mutate()} />;
  }

  if (!tasks || tasks.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={SearchX}
          title="No tasks match your filters"
          description="Try a different search or clear your filters."
          action={
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={ListTodo}
        title="No tasks yet"
        description="Add your first task to get started."
        action={
          <Button onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2" role="list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          mutate={mutate}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
}
