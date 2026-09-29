import type { Metadata } from "next";
import { SquareKanban } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata: Metadata = {
  title: "Board · Monkey TO-DO",
};

export default function BoardPage() {
  return (
    <div>
      <PageHeader title="Board" />
      <EmptyState
        icon={SquareKanban}
        title="No tasks yet"
        description="Add your first task to get started."
      />
    </div>
  );
}
