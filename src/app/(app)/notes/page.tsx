import type { Metadata } from "next";
import { Suspense } from "react";

import { NotesPageClient } from "./NotesPageClient";

export const metadata: Metadata = {
  title: "Notes · Monkey TO-DO",
};

export default function NotesPage() {
  return (
    <Suspense>
      <NotesPageClient />
    </Suspense>
  );
}
