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
  onJumpToDay?: (day: number) => void; // optional: switch “Today” to this day
};

export function DayPreviewSheet({ open, onOpenChange, brief, canJump = false, onJumpToDay }: Props) {
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

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {canJump ? (
                  <Button onClick={() => brief && onJumpToDay?.(brief.day)}>
                    Go to this day
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
