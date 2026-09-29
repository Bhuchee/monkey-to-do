"use client";

import { NotebookPen, Plus, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function NoteList({
  notes,
  isLoading,
  error,
  onRetry,
  selectedId,
  onSelect,
  onCreate,
  searchValue,
  onSearchChange,
}: {
  notes: Note[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onCreate: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col border-border md:w-[320px] md:shrink-0 md:border-r">
      <div className="flex w-full min-w-0 flex-col gap-3 border-b border-border p-3">
        <div className="relative w-full min-w-0">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
            aria-hidden="true"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
            className="w-full pl-8"
          />
        </div>
        <Button variant="secondary" className="w-full" onClick={onCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[56px] w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Couldn't load your notes." onRetry={onRetry} />
        ) : !notes || notes.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No notes yet"
            description="Create your first note to get started."
            action={
              <Button onClick={onCreate}>
                <Plus className="size-4" aria-hidden="true" />
                New note
              </Button>
            }
          />
        ) : (
          <ul className="w-full min-w-0">
            {notes.map((note) => {
              const active = note.id === selectedId;
              const preview = note.content.split("\n")[0]?.trim();
              return (
                <li key={note.id} className="w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelect(note.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full min-w-0 flex-col gap-0.5 border-l-2 border-transparent px-3 py-3 text-left",
                      active ? "border-brand bg-brand-soft" : "hover:bg-surface-raised",
                    )}
                  >
                    <span className="w-full min-w-0 truncate text-sm font-medium text-fg">
                      {note.title.trim() || "Untitled note"}
                    </span>
                    {preview ? (
                      <span className="w-full min-w-0 truncate text-sm text-fg-muted">{preview}</span>
                    ) : null}
                    <span className="text-xs text-fg-muted">{formatRelativeTime(note.updatedAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
