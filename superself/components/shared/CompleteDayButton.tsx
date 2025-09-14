// components/shared/CompleteDayButton.tsx
"use client";
import { useEffect, useState } from "react";
import { getDayCompleted, setDayCompleted } from "@/lib/progress";
import { toast } from "sonner";
import { awardForDayCompletion, completeDayWithPolicy } from "@/lib/gamification";

export function CompleteDayButton({
  day,
  enabled,
  onChange,
}: {
  day: number;
  enabled: boolean; // parent decides gating
  onChange?: (completed: boolean) => void;
}) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(getDayCompleted(day));
  }, [day]);

  function markCompleteOnce() {
    if (completed) return; // lock once completed
    completeDayWithPolicy(day);
    //setDayCompleted(day, true);
    setCompleted(true);
    toast.success("Day completed", {
      description: `Nice! Day ${day} is in the books.`,
    });
    onChange?.(true);
  }

  const canClick = enabled && !completed; // cannot undo once completed

  return (
    <button
      //onClick={canClick ? markCompleteOnce : undefined}
      onClick={() => {
      markCompleteOnce();
      const { gained, levelUp, newLevel } = awardForDayCompletion(day);
      if (gained > 0) {
        toast.success(`+${gained} XP`, { description: `Day ${day} completed` });
      }
      if (levelUp) {
        toast(`Level up!`, { description: `You reached level ${newLevel} 🚀`, richColors: true });
        // optional: confetti here
        // import confetti from "canvas-confetti"; confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
  }}
      className={`inline-flex items-center rounded-md border px-4 py-2 text-sm ${canClick ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"}`}
      aria-disabled={!canClick}
      title={completed ? "Completed" : !canClick ? "Complete the action to enable" : "Mark complete"}
    >
      {completed ? "✓ Day Completed" : "Mark day complete"}
    </button>
  );
}
