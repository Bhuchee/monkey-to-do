import type { Metadata } from "next";
import { NotebookPen, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Notes · Monkey TO-DO",
};

export default function NotesPage() {
  return (
    <div>
      <PageHeader title="Notes" />
      <EmptyState
        icon={NotebookPen}
        title="No notes yet"
        description="Create your first note to get started."
        action={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            New note
          </Button>
        }
      />
    </div>
  );
}
