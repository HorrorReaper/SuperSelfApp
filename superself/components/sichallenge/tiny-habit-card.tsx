"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { awardXpServer } from "@/lib/xp-server";
import { insertActivity } from "@/lib/social";
import { supabase } from "@/lib/supabase";
import { completeTinyHabit, loadState, saveState, STATE_UPDATED_EVENT } from "@/lib/local";

type Props = {
  habitType: "timeboxing" | "lights_down" | "mobility";
  day: number;
  done: boolean;                 // Parent controls this; we reflect it
  onComplete: (done: boolean) => void;
};

const LABELS: Record<Props["habitType"], { title: string; desc: string; cta?: string }> = {
  timeboxing: {
    title: "Tiny Habit: Timebox tomorrow",
    desc: "Pick tomorrow’s top task and schedule 15–25 minutes.",
    cta: "Open calendar",
  },
  lights_down: {
    title: "Tiny Habit: Lights‑down hour",
    desc: "Dim lights and reduce screens before your sleep window.",
    cta: "Set reminder",
  },
  mobility: {
    title: "Tiny Habit: 2‑minute mobility",
    desc: "Loosen up with a quick set: neck rolls, hip circles, or calf stretch.",
    cta: "Start 2‑min timer",
  },
};

// Tweak as desired
const TINY_HABIT_XP = 10;

export function TinyHabitCard({ habitType, day, done, onComplete }: Props) {
  const cfg = LABELS[habitType];

  // Timer state (only used for mobility) - 2 minutes
  const DURATION_SEC = 120;
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);
  const [awarding, setAwarding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const alreadyDoneRef = useRef(done); // capture initial done

  // Keep local UI consistent if parent toggles "done"
  useEffect(() => {
    if (done) {
      setRunning(false);
      setSecondsLeft(DURATION_SEC);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    alreadyDoneRef.current = done;
  }, [done, DURATION_SEC]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  async function awardOnce() {
    // Prevent double-awards client side; server upsert is also idempotent
    if (awarding || alreadyDoneRef.current) return;
    setAwarding(true);
    try {
      const { error } = await awardXpServer("tiny_habit", day, TINY_HABIT_XP);
      if (!error || /duplicate key|unique/i.test(error.message)) {
        toast.success(`+${TINY_HABIT_XP} XP`, { description: "Tiny habit completed" });
        alreadyDoneRef.current = true;
        // Try to insert an activity row so the navbar and friends feed show this tiny habit
        try {
          const { data: auth } = await supabase.auth.getUser();
          const uid = auth.user?.id;
          if (uid) {
            await insertActivity({ actor_id: uid, type: "tiny_habit", day, xp: TINY_HABIT_XP, message: null }).catch(() => {});
            // Update local challenge state: mark tiny habit done and bump xp so navbar updates immediately
            try {
              completeTinyHabit(day, true);
              const s = loadState();
              if (s) {
                s.xp = (s.xp ?? 0) + TINY_HABIT_XP;
                saveState(s);
                // Notify listeners (same-tab)
                window.dispatchEvent(new CustomEvent(STATE_UPDATED_EVENT));
              }
            } catch (err: unknown) {
                      // swallow local update errors
                      console.error("local state update failed", err);
                    }
          }
        } catch (e) {
          // best-effort; ignore errors
                  console.error("Tiny habit activity insert failed", e);
        }
      } else {
        toast.error("XP sync failed", { description: error.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("XP sync failed", { description: msg ?? "Unknown error" });
    } /*finally {
      setAwarding(false);
    }*/
  }

  function startTimer() {
    if (running || done) return;
    setRunning(true);
    setSecondsLeft(DURATION_SEC);
    if (timerRef.current) window.clearInterval(timerRef.current);
  timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Finish
          if (timerRef.current) {
            window.clearInterval(timerRef.current); 
            timerRef.current = null;
          }
          setRunning(false);
          // Mark done + award (deferred to avoid setState during render)
          queueMicrotask(() => onComplete(true));
          void awardOnce();
          return DURATION_SEC;
        }
        return prev - 1;
      });
  }, 1000) as unknown as number;
  }

  function cancelTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setSecondsLeft(DURATION_SEC);
  }

  async function handleManualComplete(checked: boolean | string) {
    const isDone = Boolean(checked);
    if (isDone) {
      // defer parent update to avoid setState-in-render
      queueMicrotask(() => onComplete(true));
      await awardOnce();
    } else {
      // defer uncheck as well
      queueMicrotask(() => onComplete(false));
    }
  }

  function handleCTA() {
    // You can replace these with real actions (calendar deep link, Notification API prompt, etc.)
    if (habitType === "mobility") {
      startTimer();
    } else if (habitType === "timeboxing") {
      // simple helpful default: open Google Calendar
      window.open("https://calendar.google.com/calendar/u/0/r/week", "_blank", "noopener,noreferrer");
    } else if (habitType === "lights_down") {
      // basic reminder suggestion
      toast("Tip", { description: "Set a phone reminder for lights-down hour tonight." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{cfg.title}</CardTitle>
        <CardDescription>{cfg.desc}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Checkbox
          checked={done}
          disabled={awarding || running}
          onCheckedChange={handleManualComplete}
        />
        <div className="text-sm">
          {done ? "Completed today" : habitType === "mobility" && running ? `Timer: ${timeLabel}` : "Mark done when completed"}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {habitType === "mobility" && running ? (
            <Button variant="ghost" onClick={cancelTimer}>Cancel</Button>
          ) : cfg.cta ? (
            <Button variant="secondary" onClick={handleCTA} disabled={done || awarding}>
              {cfg.cta}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
