import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <CircleAlert className="size-10 text-danger" strokeWidth={1.75} aria-hidden="true" />
      <p className="text-sm font-medium text-fg">Something went wrong</p>
      <p className="max-w-xs text-sm text-fg-muted">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
