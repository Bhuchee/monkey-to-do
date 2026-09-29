import useSWR from "swr";

import { listNotes } from "@/lib/api-client";

export function useNotes(params?: Record<string, string>) {
  const key = ["/api/notes", params ?? {}] as const;
  const { data, error, isLoading, mutate } = useSWR(key, () => listNotes(params));

  return { notes: data, isLoading, error, mutate };
}
