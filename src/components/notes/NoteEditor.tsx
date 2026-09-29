"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, CircleAlert, LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateNote, type Note } from "@/lib/api-client";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NoteEditor({
  note,
  onSaved,
  onRequestDelete,
  onBack,
}: {
  note: Note;
  onSaved: (note: Note) => void;
  onRequestDelete: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const latest = useRef({ title: note.title, content: note.content });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setStatus("idle");
    latest.current = { title: note.title, content: note.content };
    dirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  async function save() {
    dirtyRef.current = false;
    setStatus("saving");
    try {
      const saved = await updateNote(note.id, { ...latest.current });
      onSaved(saved);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (dirtyRef.current) {
        // Flush an unsaved edit before this note unmounts (e.g. the user
        // switched notes inside the 800ms debounce window) so nothing typed
        // is ever silently dropped.
        void updateNote(note.id, { ...latest.current });
      }
    };
  }, [note.id]);

  function handleChange(nextTitle: string, nextContent: string) {
    latest.current = { title: nextTitle, content: nextContent };
    dirtyRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 800);
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
            aria-label="Back to notes"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <SaveStatusIndicator status={status} />
        </div>
        <Button variant="ghost" size="icon" aria-label="Delete note" onClick={onRequestDelete}>
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 md:px-6">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleChange(e.target.value, content);
          }}
          placeholder="Untitled note"
          aria-label="Note title"
          className="w-full min-w-0 border-0 bg-transparent text-xl font-semibold text-fg outline-none placeholder:text-fg-subtle"
        />
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleChange(title, e.target.value);
          }}
          placeholder="Start writing…"
          aria-label="Note content"
          className="min-h-[300px] w-full min-w-0 flex-1 resize-none border-0 bg-transparent text-base leading-[26px] text-fg outline-none placeholder:text-fg-subtle"
        />
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-success">
        <Check className="size-3.5" aria-hidden="true" />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-danger">
        <CircleAlert className="size-3.5" aria-hidden="true" />
        Couldn&apos;t save — retrying
      </span>
    );
  }
  return null;
}
