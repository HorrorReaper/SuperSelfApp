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
import type { MoodLevel } from "@/lib/types";
import { cn } from "@/lib/utils"; // optional classnames helper, or swap cn(...) with template strings
import { awardForMoodCheckin } from "@/lib/gamification";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (mood: MoodLevel, note?: string) => void;
  defaultMood?: MoodLevel | null;
};

const MOODS: { key: MoodLevel; label: string; emoji: string; color: string }[] = [
  { key: "super",       label: "Super",       emoji: "🤩", color: "bg-emerald-500" },
  { key: "good",        label: "Good",        emoji: "🙂", color: "bg-sky-500" },
  { key: "normal",      label: "Normal",      emoji: "😐", color: "bg-slate-400" },
  { key: "not_really",  label: "Not really",  emoji: "😕", color: "bg-amber-500" },
  { key: "terrible",    label: "Terrible",    emoji: "😣", color: "bg-rose-500" },
];

export function MoodCheckinModal({ open, onOpenChange, onSubmit, defaultMood = null }: Props) {
  const [mood, setMood] = React.useState<MoodLevel | null>(defaultMood);
  const [showJournal, setShowJournal] = React.useState(false);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMood(defaultMood ?? null);
      setShowJournal(false);
      setNote("");
    }
  }, [open, defaultMood]);

  function handleSubmitMoodOnly() {
    if (!mood) return;
    onSubmit(mood, undefined);
    const { gained, levelUp, newLevel } = awardForMoodCheckin(1);
    if (gained > 0) {
      toast.success(`+${gained} XP`, { description: `Mood check-in recorded` });
    }
    if (levelUp) {
      toast(`Level up!`, { description: `You reached level ${newLevel} 🚀`, richColors: true });

    }
    onOpenChange(false);
  }

  function handleSubmitWithJournal() {
    if (!mood) return;
    onSubmit(mood, note.trim() || undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
          <DialogDescription>Select one. You can add a short journal if you want.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mood emojis row */}
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "rounded-2xl px-2 py-3 text-center transition border",
                    selected
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-neutral-100 dark:bg-neutral-800 border-transparent hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80"
                  )}
                  aria-pressed={selected}
                >
                  <div className="text-2xl leading-none">{m.emoji}</div>
                  <div className="mt-1 text-[11px]">{m.label}</div>
                </button>
              );
            })}
          </div>

          {/* Actions row: submit mood only OR open journal */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
            {!showJournal ? (
              <>
                <Button
                  variant="secondary"
                  disabled={!mood}
                  onClick={handleSubmitMoodOnly}
                  title="Submit just your mood"
                >
                  Submit mood
                </Button>
                <Button
                  disabled={!mood}
                  onClick={() => setShowJournal(true)}
                  title="Add a short journal"
                >
                  Journal
                </Button>
              </>
            ) : (
              <Button disabled={!mood} onClick={handleSubmitWithJournal}>
                Submit mood + journal
              </Button>
            )}
          </div>

          {/* Journal (revealed only after pressing “Journal”) */}
          {showJournal && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1">
              <div className="text-sm font-medium">Why do you feel this way? (optional)</div>
              <Textarea
                placeholder="Write a few sentences about your day…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                You can leave this blank and still submit your mood.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
