"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";

import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteList } from "@/components/notes/NoteList";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotes } from "@/hooks/useNotes";
import { ApiError, createNote, deleteNote, type Note } from "@/lib/api-client";

export function NotesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id") ?? undefined;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { notes, isLoading, error, mutate } = useNotes(debouncedQ ? { q: debouncedQ } : undefined);
  const selectedNote = notes?.find((n) => n.id === selectedId);

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  function selectNote(id: string) {
    router.push(`/notes?id=${id}`);
  }

  function backToList() {
    router.push("/notes");
  }

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const note = await createNote({});
      mutate((current) => (current ? [note, ...current] : [note]), { revalidate: false });
      router.push(`/notes?id=${note.id}`);
    } catch {
      toast.error("Couldn't create note. Try again.");
    } finally {
      setCreating(false);
    }
  }

  function handleSaved(saved: Note) {
    mutate((current) => current?.map((n) => (n.id === saved.id ? saved : n)), {
      revalidate: false,
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    try {
      await deleteNote(target.id);
      const remaining = (notes ?? []).filter((n) => n.id !== target.id);
      mutate(remaining, { revalidate: false });
      toast.success("Note deleted");
      setDeleteTarget(null);
      if (selectedId === target.id) {
        router.push(remaining.length > 0 ? `/notes?id=${remaining[0].id}` : "/notes");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error("Note not found");
        mutate();
        setDeleteTarget(null);
      } else {
        toast.error("Couldn't delete note. Try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col overflow-hidden rounded-lg border border-border md:h-[calc(100vh-64px)] md:flex-row">
      <div className={selectedId ? "hidden md:flex md:h-full" : "flex h-full"}>
        <NoteList
          notes={notes}
          isLoading={isLoading}
          error={error}
          onRetry={() => mutate()}
          selectedId={selectedId}
          onSelect={selectNote}
          onCreate={handleCreate}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />
      </div>

      <div className={selectedId ? "flex h-full flex-1" : "hidden h-full flex-1 md:flex"}>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onSaved={handleSaved}
            onRequestDelete={() => setDeleteTarget(selectedNote)}
            onBack={backToList}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-surface-raised">
              <NotebookPen className="size-10 text-fg-muted" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-fg">Select a note</p>
            <p className="max-w-xs text-sm text-fg-muted">
              Choose a note from the list, or create a new one.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this note?"
        description="This can't be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
