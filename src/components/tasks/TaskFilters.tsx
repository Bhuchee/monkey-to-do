"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_KEYS = ["q", "status", "priority", "due"] as const;

const STATUS_LABELS: Record<string, string> = {
  all: "All statuses",
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const PRIORITY_LABELS: Record<string, string> = {
  all: "All priorities",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const DUE_LABELS: Record<string, string> = {
  all: "All due dates",
  overdue: "Overdue",
  today: "Today",
  week: "Next 7 days",
  none: "No date",
};

export function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [qInput, setQInput] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (qInput === currentQ) return;

    const handle = setTimeout(() => {
      updateParams({ q: qInput || null });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  function updateParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `/tasks?${qs}` : "/tasks");
  }

  function updateDue(value: string | null) {
    updateParams({ due: value === "all" || value === null ? null : value });
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  function clearFilters() {
    setQInput("");
    router.replace("/tasks");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
        <Input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          className="pl-8"
        />
      </div>

      <Select value={searchParams.get("status") ?? "all"} onValueChange={(v) => updateParams({ status: v === "all" ? null : v })}>
        <SelectTrigger aria-label="Filter by status">
          <SelectValue>{(value: string) => STATUS_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="todo">To do</SelectItem>
          <SelectItem value="in_progress">In progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("priority") ?? "all"}
        onValueChange={(v) => updateParams({ priority: v === "all" ? null : v })}
      >
        <SelectTrigger aria-label="Filter by priority">
          <SelectValue>{(value: string) => PRIORITY_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={searchParams.get("due") ?? "all"} onValueChange={updateDue}>
        <SelectTrigger aria-label="Filter by due date">
          <SelectValue>{(value: string) => DUE_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All due dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">Next 7 days</SelectItem>
          <SelectItem value="none">No date</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Button variant="secondary" onClick={clearFilters}>
          <FilterX className="size-4" aria-hidden="true" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
