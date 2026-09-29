"use client";

import { useEffect, useState } from "react";
import { UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";

const DISMISS_KEY = "mtd_guest_banner_dismissed";

export function GuestBanner() {
  const { me } = useMe();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!me?.isGuest || dismissed) {
    return null;
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage may be unavailable (private mode, blocked site data); dismissal just won't persist.
    }
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
      <UserRound className="size-4 shrink-0 text-fg-muted" strokeWidth={1.75} aria-hidden="true" />
      <p className="flex-1 text-sm text-fg-muted">
        You&apos;re in a guest workspace. Your data is saved in this browser.
      </p>
      <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={dismiss}>
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
