import { Banana } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <span
        role="img"
        aria-label="Monkey TO-DO"
        className="flex size-8 items-center justify-center rounded-lg bg-brand"
      >
        <Banana className="size-5 text-brand-fg" strokeWidth={2} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2.5" aria-label="Monkey TO-DO">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand"
      >
        <Banana className="size-5 text-brand-fg" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="text-base font-bold">
        <span className="text-fg">Monkey</span> <span className="text-brand">TO-DO</span>
      </span>
    </span>
  );
}
