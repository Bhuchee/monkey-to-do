import type { Metadata } from "next";
import { Suspense } from "react";

import { TasksPageClient } from "./TasksPageClient";

export const metadata: Metadata = {
  title: "Tasks · Monkey TO-DO",
};

export default function TasksPage() {
  return (
    <Suspense>
      <TasksPageClient />
    </Suspense>
  );
}
