import type { Metadata } from "next";
import { ListTodo, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tasks · Monkey TO-DO",
};

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Tasks"
        action={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />
      <EmptyState
        icon={ListTodo}
        title="No tasks yet"
        description="Add your first task to get started."
        action={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />
    </div>
  );
}
