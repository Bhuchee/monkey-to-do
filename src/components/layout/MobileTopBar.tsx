import Link from "next/link";

import { Logo } from "@/components/layout/Logo";

export function MobileTopBar() {
  return (
    <div className="flex h-14 items-center border-b border-border bg-surface px-4 md:hidden">
      <Link href="/tasks" aria-label="Monkey TO-DO">
        <Logo />
      </Link>
    </div>
  );
}
