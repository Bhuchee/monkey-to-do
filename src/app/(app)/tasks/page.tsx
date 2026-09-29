import type { Metadata } from "next";

import { TasksPageClient } from "./TasksPageClient";

export const metadata: Metadata = {
  title: "Tasks · Monkey TO-DO",
};

export default function TasksPage() {
  return <TasksPageClient />;
}
