// components/shared/CompleteDayButton.tsx
"use client";
import { useEffect, useState } from "react";
import { getDayCompleted, setDayCompleted } from "@/lib/progress";
import { toast } from "sonner";
import { awardForDayCompletion, completeDayWithPolicy } from "@/lib/gamification";
import { insertActivity } from "@/lib/social";
import { supabase } from "@/lib/supabase";
import { awardXpServer } from "@/lib/xp-server";
import { computeUnlocksFromState, unlockOnServer } from "@/lib/achievements/achievements";
import { loadState } from "@/lib/local";
import { ChallengeState } from "@/lib/types";

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCompleted(getDayCompleted(day));
  }, [day]);

  /*async function markCompleteOnce() {
    if (completed) return; // lock once completed
    const res = completeDayWithPolicy(day);

    if (!res?.ok) { /* ...  return; }
    res = await awardXpServer("day_complete", day, award.gained);
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
  }*/
 
 async function markCompleteOnce() {
  if (completed || submitting) return;         // avoid duplicates
  setSubmitting(true);

  try {
    // 1) Apply local completion with policy (mutates local state + saves)
    const result = completeDayWithPolicy(day);
    if (!result?.ok) {
      toast.error("Could not complete the day");
      return;
    }

    const { award, policy } = result;          // award.gained, levelUp, newLevel etc.

    // 2) Mirror XP to server (idempotent by kind+day)
    if(!award){return;}
    const server = await awardXpServer("day_complete", day, award.gained);
    const keys = computeUnlocksFromState(loadState<ChallengeState>()!);
    unlockOnServer(keys);
    if (server.error) {
      // Optional: ignore duplicate unique_violation or show soft warning for offline
      // if (!/duplicate key|unique/i.test(server.error.message)) {
      //   toast("Saved locally", { description: "Will sync XP when back online." });
      // }
      console.error("XP award failed:", server.error);
    }

    // 3) UI updates + toasts
    const pct = Math.round((policy?.xpMult ?? 1) * 100);
    const label =
      policy?.reason === "on_time"
        ? "On‑time completion"
        : policy?.reason === "grace"
        ? "Grace completion"
        : "Make‑up completion";

    toast.success(`+${award.gained} XP`, {
      description: `${label} (${pct}% XP${policy?.countsForStreak ? ", streak counts" : ", no streak"})`,
    });
    if (award.levelUp) {
      toast("Level up!", { description: `You reached level ${award.newLevel} 🚀` });
    }

    // 4) Activity feed (best-effort)
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (uid) {
      await insertActivity({
        actor_id: uid,
        type: "day_complete",
        day,
        xp: award.gained,
        message: null,
      }).catch(() => {});
      // 4b) Mirror the per-day completion to the server challenge_days table
      try {
        const dateIso = new Date().toISOString().slice(0, 10);
        await supabase.from("challenge_days").upsert({
          user_id: uid,
          day_number: day,
          date_iso: dateIso,
          completed: true,
          credited_to_streak: policy?.countsForStreak ?? true,
          habit_minutes: 0,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,day_number" });

        // Fetch authoritative streak from server RPC and optionally update local state
        const { data: streak, error: streakErr } = await supabase.rpc("get_my_streak");
        if (!streakErr && typeof streak === "number") {
          // best-effort: update local persisted state so UI matches server
          try {
            const s = loadState<ChallengeState>();
            if (s) {
              s.streak = streak as number;
              // reflect in saved state and notify
              // reuse existing saveState which triggers mirrorProfileFromState
              // import saveState lazily to avoid circular issues
              const { saveState } = await import("@/lib/local");
              saveState(s);
            }
          } catch (e) {
            // ignore local update errors
          }
        }
      } catch (err) {
        // ignore best-effort mirror errors
        console.error("Failed to mirror challenge_day to server", err);
      }
    }

    // 5) Update local UI state
    setCompleted(true);
    onChange?.(true);
  } finally {
    setSubmitting(false);
  }
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
