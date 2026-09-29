import useSWR from "swr";

import { getMe } from "@/lib/api-client";

export function useMe() {
  const { data, error, isLoading } = useSWR("/api/me", getMe);

  return { me: data, isLoading, error };
}
