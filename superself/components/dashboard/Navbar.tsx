"use client";

import { cn } from "@/lib/utils"; // if you don't have cn, see helper below
import { Trophy } from "lucide-react";
import * as React from "react";

type Props = {
  title?: string;
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  xpPct: number; // 0..1
  rightSlot?: React.ReactNode; // optional actions (e.g., settings)
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
  const pct = Math.round(Math.min(1, Math.max(0, xpPct)) * 100);

  return (
    <div className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="mx-auto max-w-screen-sm h-12 px-3 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
          <span className="truncate font-medium">{title}</span>
        </div>

        {/* XP block */}
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
    </div>
  );
}