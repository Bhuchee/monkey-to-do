import type { Metadata } from "next";

import { Board } from "@/components/board/Board";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Board · Monkey TO-DO",
};

export default function BoardPage() {
  return (
    <div>
      <PageHeader title="Board" />
      <Board />
    </div>
  );
}
