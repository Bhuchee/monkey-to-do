"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/Logo";
import { navItems } from "@/components/layout/nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col border-r border-border bg-surface md:flex md:w-[72px] lg:w-[240px]">
      <div className="flex h-16 items-center px-4 lg:px-5">
        <Link href="/tasks" aria-label="Monkey TO-DO" className="lg:hidden">
          <Logo collapsed />
        </Link>
        <Link href="/tasks" className="hidden lg:block">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "justify-center lg:justify-start",
                active
                  ? "bg-brand-soft text-brand"
                  : "text-fg-muted hover:bg-surface-raised hover:text-fg",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side="right" className="lg:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
