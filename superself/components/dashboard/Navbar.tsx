"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils"; // or use the helper at the bottom

type Props = {
  title?: string;
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  xpPct: number; // 0..1
  rightSlot?: React.ReactNode; // e.g., <UserButton />
  className?: string;
};

export function NavBar({
  title = "30‑Day Challenge",
  level,
  xpInLevel,
  xpNeeded,
  xpPct,
  rightSlot,
  className,
}: Props) {
  const pathnameRaw = usePathname() || "/";
  const pathname = pathnameRaw.replace(/\/+$/, ""); // normalize trailing slash

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/journeys/self-improvement-journey", label: "Journey" },
  ];

  const pct = Math.round(Math.min(1, Math.max(0, xpPct)) * 100);

  const isActive = (href: string) =>
    pathname === href.replace(/\/+$/, "");

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="mx-auto max-w-screen-sm h-12 px-3 flex items-center gap-3">
        {/* Left: app title */}
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
          <span className="truncate font-medium">{title}</span>
        </div>

        {/* Center: nav links */}
        <nav aria-label="Primary" className="ml-3 hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                isActive(l.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: level/xp + user button */}
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
            Lv {level}
          </span>

          <div className="flex items-center gap-2">
            <div
              className="relative h-2 w-40 overflow-hidden rounded-full bg-muted"
              aria-label={`XP progress: ${pct}%`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              title={`${xpInLevel}/${xpNeeded} XP`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {xpInLevel}/{xpNeeded} XP
            </span>
          </div>

          {rightSlot}
        </div>
      </div>

      {/* Mobile nav (optional): show links under the bar on small screens */}
      <div className="sm:hidden border-t bg-background/70">
        <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "px-2 py-1 text-sm rounded-md",
                isActive(l.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
