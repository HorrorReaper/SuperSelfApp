// components/shared/CompleteDayButton.tsx
"use client";
import { useEffect, useState } from "react";
import { getDayCompleted, setDayCompleted } from "@/lib/progress";
import { toast } from "sonner";

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
    setDayCompleted(day, true);
    setCompleted(true);
    toast.success("Day completed", {
      description: `Nice! Day ${day} is in the books.`,
    });
    onChange?.(true);
  }

  const canClick = enabled && !completed; // cannot undo once completed

  return (
    <button
  onClick={canClick ? markCompleteOnce : undefined}
      className={`inline-flex items-center rounded-md border px-4 py-2 text-sm ${canClick ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"}`}
      aria-disabled={!canClick}
      title={completed ? "Completed" : !canClick ? "Complete the action to enable" : "Mark complete"}
    >
      {completed ? "✓ Day Completed" : "Mark day complete"}
    </button>
  );
}
