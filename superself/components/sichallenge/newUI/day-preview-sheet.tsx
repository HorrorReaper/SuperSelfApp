"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { previewMakeupPolicy } from "@/lib/gamification";
import { CompleteDayButton } from "@/components/shared/CompleteDayButton"; // NEW

type Brief = {
  day: number;
  title: string;
  tldr: string;
  content: string;
  controlquestion?: string;
  actionLabel?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  brief: Brief | null;
  canJump?: boolean;
  onJumpToDay?: (day: number) => void;

  // NEW: allow finishing "today" from the sheet if parent says the action is done
  canCompleteToday?: boolean;

  // NEW: optional hook after completion (e.g., close sheet, refresh)
  onCompleted?: () => void;

  // Optional: pass today's day; falls back to state
  todayDay?: number;
};

export function DayPreviewSheet({
  open,
  onOpenChange,
  brief,
  canJump = false,
  onJumpToDay,
  canCompleteToday = false,
  onCompleted,
  todayDay,
}: Props) {
  const s = loadState<ChallengeState>();
  const currentToday = todayDay ?? s?.todayDay ?? 1;

  const completed = React.useMemo(() => {
    if (!brief || !s?.days) return false;
    return !!s.days.find((d) => d.day === brief.day && d.completed);
  }, [brief, s?.days]);

  const policy = React.useMemo(() => {
    if (!brief) return null;
    return previewMakeupPolicy(brief.day);
  }, [brief]);

  // NEW: decide if we show/enable the finish button
  const isPast = !!brief && brief.day < currentToday;
  const isToday = !!brief && brief.day === currentToday;
  const isFuture = !!brief && brief.day > currentToday;

  // For past days: always allow completion (make-up rules apply)
  // For today: only if parent gated action is done
  const showFinishButton = !!brief && !completed && !isFuture;
  const finishEnabled = isPast ? true : isToday ? canCompleteToday : false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px]">
        {!brief ? (
          <div className="p-4 text-sm text-muted-foreground">No preview available.</div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                Day {brief.day}: {brief.title}
              </SheetTitle>
              <SheetDescription>{brief.tldr}</SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              {/* Make-up notice for past, incomplete days */}
              {isPast && !completed && (
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium mb-1">Make-up day</div>
                  <p className="text-muted-foreground">
                    Completing this now grants{" "}
                    <span className="font-medium">
                      {Math.round(((policy?.xpMult ?? 1) * 100))}% XP
                    </span>
                    {policy?.reason === "grace" ? " (using weekly grace)" : ""}
                    {policy?.countsForStreak ? " and counts for your streak." : " and will not count toward your streak."}
                  </p>
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {brief.content}
              </div>

              {brief.controlquestion ? (
                <>
                  <Separator />
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium mb-1">Control question</div>
                    <div className="text-sm text-muted-foreground">
                      {brief.controlquestion}
                    </div>
                  </div>
                </>
              ) : null}

              {brief.actionLabel ? (
                <div className="text-sm">
                  <span className="font-medium">Action: </span>
                  {brief.actionLabel}
                </div>
              ) : null}

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {canJump ? (
                  <Button variant="secondary" onClick={() => onJumpToDay?.(brief.day)}>
                    Go to this day
                  </Button>
                ) : <span />}

                {/* NEW: Finish button shown for past or today (when eligible) */}
                {showFinishButton ? (
                  <CompleteDayButton
                    day={brief.day}
                    enabled={finishEnabled}
                    onChange={(completed) => {
                      if (completed) {
                        onCompleted?.();
                        onOpenChange(false);
                      }
                    }}
                  />
                ) : (
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                )}
              </div>

              {/* If completed, show a small confirmation and an Undo could go here later */}
              {completed && (
                <div className="text-xs text-muted-foreground">
                  This day is already completed.
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
