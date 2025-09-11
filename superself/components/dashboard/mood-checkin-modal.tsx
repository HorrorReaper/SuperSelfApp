// components/mood-checkin-modal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // optional classnames helper
import type { MoodLevel } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (mood: MoodLevel, note?: string) => void;
  defaultMood?: MoodLevel | null;
};

const MOODS: { key: MoodLevel; label: string; color: string }[] = [
  { key: "super", label: "Super", color: "bg-emerald-500" },
  { key: "good", label: "Good", color: "bg-sky-500" },
  { key: "normal", label: "Normal", color: "bg-slate-400" },
  { key: "not_really", label: "Not really", color: "bg-amber-500" },
  { key: "terrible", label: "Terrible", color: "bg-rose-500" },
];

export function MoodCheckinModal({ open, onOpenChange, onSubmit, defaultMood = null }: Props) {
  const [mood, setMood] = React.useState<MoodLevel | null>(defaultMood);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMood(defaultMood ?? null);
      setNote("");
    }
  }, [open, defaultMood]);

  function handleSubmit(includeNote: boolean) {
    if (!mood) return;
    onSubmit(mood, includeNote ? note.trim() || undefined : undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
          <DialogDescription>Pick one. You can add a short journal if you like.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mood choices */}
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "rounded-xl px-2 py-3 text-center text-xs font-medium transition border",
                    selected
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-neutral-100 dark:bg-neutral-800 border-transparent hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80"
                  )}
                  aria-pressed={selected}
                >
                  <div className={cn("w-2 h-2 rounded-full mx-auto mb-1", m.color)} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Journal area */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Journal (optional)</div>
            <Textarea
              placeholder="Write a few sentences about your day…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              You can submit your mood without journaling, or include this note.
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
            <Button variant="secondary" disabled={!mood} onClick={() => handleSubmit(false)}>
              Send mood only
            </Button>
            <Button disabled={!mood} onClick={() => handleSubmit(true)}>
              Send mood + journal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
