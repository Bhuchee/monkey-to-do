import useSWR from "swr";

import { listTasks } from "@/lib/api-client";

export function useTasks(params?: Record<string, string>) {
  const key = ["/api/tasks", params ?? {}] as const;
  const { data, error, isLoading, mutate } = useSWR(key, () => listTasks(params));

  return { tasks: data, isLoading, error, mutate };
}
