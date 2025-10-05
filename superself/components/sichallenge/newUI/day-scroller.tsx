"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // or inline a tiny cn helper
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Minus } from "lucide-react";

type Props = {
  totalDays?: number;           // default 30
  todayDay: number;             // e.g., 12
  selectedDay: number;          // currently focused/selected day
  // When null, server data is still loading (sync in progress). If undefined or an array, use that list.
  completedDays?: number[] | null;     // list of completed day numbers or null while syncing
  onPick: (day: number) => void;
};

type DayState = "selected" | "today" | "completed" | "missed" | "future";

export function DayScroller({
  totalDays = 30,
  todayDay,
  selectedDay,
  completedDays = undefined,
  onPick,
}: Props) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const btnRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const isSyncing = completedDays === null;
  const completedSet = React.useMemo(() => new Set(completedDays ?? []), [completedDays]);

  function getState(day: number): DayState {
    if (day === selectedDay) return "selected";
    if (day === todayDay) return "today";
    if (completedSet.has(day)) return "completed";
    if (day < todayDay) return "missed";
    return "future";
  }

  function updateShadows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  React.useEffect(() => {
    updateShadows();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateShadows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateShadows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  // Ensure the selected day is visible when it changes
  React.useEffect(() => {
    const idx = selectedDay - 1;
    const btn = btnRefs.current[idx];
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedDay]);

  function scrollByDir(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const next = Math.min(Math.max(1, selectedDay + delta), totalDays);
      onPick(next);
      btnRefs.current[next - 1]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      onPick(1);
      btnRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      onPick(totalDays);
      btnRefs.current[totalDays - 1]?.focus();
    }
  }

  return (
    <div className="relative">
      {/* Small sync indicator when server-backed list is being fetched */}
      {isSyncing && (
        <div className="absolute right-3 top-3 z-10 text-xs text-muted-foreground bg-background/60 px-2 py-1 rounded">
          Syncing…
        </div>
      )}
      {/* Arrows */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "pointer-events-auto shadow-sm",
            "bg-background/70 backdrop-blur rounded-full",
            !canLeft && "invisible"
          )}
          aria-label="Scroll days left"
          onClick={() => scrollByDir("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "pointer-events-auto shadow-sm",
            "bg-background/70 backdrop-blur rounded-full",
            !canRight && "invisible"
          )}
          aria-label="Scroll days right"
          onClick={() => scrollByDir("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Gradient edge shadows */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-10",
          "bg-gradient-to-r from-background to-transparent",
          canLeft ? "opacity-100" : "opacity-0",
          "transition-opacity"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-10",
          "bg-gradient-to-l from-background to-transparent",
          canRight ? "opacity-100" : "opacity-0",
          "transition-opacity"
        )}
      />

      {/* Scroller */}
      <nav
        aria-label="Pick a day"
        className="relative"
        onKeyDown={handleKeyDown}
      >
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2"
        >
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const state = getState(day);
            const isSelected = state === "selected";
            const isToday = state === "today";
            const isCompleted = state === "completed";
            const isMissed = state === "missed";

            return (
              <button
                key={day}
                ref={(el) => { btnRefs.current[i] = el; }}
                onClick={() => onPick(day)}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "snap-center shrink-0 h-12 w-12 rounded-full border transition",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : isToday
                    ? "bg-foreground/90 text-background border-foreground/90"
                    : isCompleted
                    ? "bg-background border-primary/40 text-primary"
                    : isMissed
                    ? "bg-muted/70 border-muted-foreground/20 text-muted-foreground"
                    : "bg-muted border-transparent hover:bg-muted/80"
                )}
                title={`Day ${day}`}
              >
                <span className="sr-only">Day</span>
                <div className="relative flex h-full w-full items-center justify-center">
                  <span className="text-sm font-medium">{day}</span>
                  {/* Status glyph */}
                  {isCompleted && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 text-primary" aria-hidden />
                  )}
                  {isMissed && (
                    <Minus className="absolute -right-1 -top-1 h-4 w-4 text-muted-foreground" aria-hidden />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
