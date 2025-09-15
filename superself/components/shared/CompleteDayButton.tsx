// components/shared/CompleteDayButton.tsx
"use client";
import { useEffect, useState } from "react";
import { getDayCompleted, setDayCompleted } from "@/lib/progress";
import { toast } from "sonner";
import { awardForDayCompletion, completeDayWithPolicy } from "@/lib/gamification";
import { insertActivity } from "@/lib/social";
import { supabase } from "@/lib/supabase";

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

  async function markCompleteOnce() {
    if (completed) return; // lock once completed
    const res = completeDayWithPolicy(day);
    if (!res?.ok) { /* ... */ return; }
    const { award } = res;
    //setDayCompleted(day, true);
    setCompleted(true);
    toast.success("Day completed", {
      description: `Nice! Day ${day} is in the books.`,
    });
    const actor_id = (await supabase.auth.getUser()).data.user!.id;
    insertActivity({ actor_id: (await supabase.auth.getUser()).data.user!.id, type: "day_complete", day, xp: award.gained, message: null })
    .catch(() => {});
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
