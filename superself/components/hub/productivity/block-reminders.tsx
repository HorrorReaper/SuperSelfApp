"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toMinutes } from "@/lib/validators";
import { todayISO, minutesToDate } from "@/lib/convert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Match your blocks shape from the planner page
type Block = {
  title: string;
  kind: "focus" | "meeting" | "break" | "mobility" | "workout" | "other" | string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  task_id?: number | null;
};

type Plan = {
  id: string;
  plan_date: string;
  frog_task_id?: number | null;
  essential_task_ids?: number[];
  blocks?: Block[];
  notes?: string | null;
};

// Optional: limit reminders to specific kinds
const REMIND_KINDS = new Set(["focus", "workout", "mobility", "meeting", "other", "break"]);
// If you only want focus blocks, use: new Set(["focus"])

// todayISO and minutesToDate are imported from lib/convert

// Unique key to dedupe reminders for a block
function blockKey(planId: string, b: Block, idx: number) {
  return `${planId}:${b.start}:${b.end}:${b.title}:${idx}`;
}

// Broadcast channel to avoid multi-tab duplicate popups
const CHANNEL = "block-reminders-v1";

export function BlockReminders() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [due, setDue] = useState<{ key: string; block: Block } | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Load today’s plan once
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_date", todayISO())
        .maybeSingle();
      setPlan(data as Plan ?? null);
    })();

    return () => {
      // cleanup timers
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  // Prepare channel for cross-tab dedupe
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = (ev) => {
      if (ev?.data?.type === "block-triggered") {
        // Mark as reminded so this tab won't also show it
        localStorage.setItem(remindedKey(ev.data.key), todayISO());
      }
    };
    return () => ch.close();
  }, []);

  function remindedKey(key: string) {
    return `blockReminded:${key}`;
  }

  // Schedule reminders for blocks
  useEffect(() => {
    if (!plan) return;
    const blocks = (plan.blocks ?? []).filter((b) => REMIND_KINDS.has(b.kind));
    // Clear any older timers before setting new
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    const now = Date.now();

    // Catch-up: if a block started in the last 3 minutes, trigger immediately if not reminded
    const JUST_PAST_MS = 3 * 60 * 1000;

    blocks.forEach((b, i) => {
      const startMin = toMinutes(b.start);
      const startAt = minutesToDate(startMin).getTime();
      const key = blockKey(plan.id, b, i);
      const reminded = localStorage.getItem(remindedKey(key)) === todayISO();

      if (reminded) return; // already handled today

      if (startAt <= now && now - startAt <= JUST_PAST_MS) {
        // Trigger immediately
        queueDue(key, b);
      } else if (startAt > now) {
        const delay = startAt - now;
        const tid = window.setTimeout(() => {
          queueDue(key, b);
        }, delay);
        timeoutsRef.current.push(tid);
      }
    });

    function queueDue(key: string, b: Block) {
      // Broadcast so other tabs suppress duplicates
      channelRef.current?.postMessage({ type: "block-triggered", key });
      localStorage.setItem(remindedKey(key), todayISO());
      setDue({ key, block: b });
    }
  }, [plan]);

  function startFocus(b: Block) {
    const dur = Math.max(1, toMinutes(b.end) - toMinutes(b.start));
    const params = new URLSearchParams({
      title: b.title,
      duration: String(dur),
      ...(b.task_id ? { task_id: String(b.task_id) } : {}),
    });
    router.push(`/focus?${params.toString()}`);
    setDue(null);
  }

  function snooze(b: Block, minutes = 5) {
    // Re-remind after N minutes (does not change the localStorage reminded flag)
    const tid = window.setTimeout(() => {
      setDue({ key: crypto.randomUUID(), block: b });
    }, minutes * 60 * 1000);
    timeoutsRef.current.push(tid);
    setDue(null);
  }

  // Nothing to render until a reminder is due
  if (!due) return null;

  const b = due.block;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) setDue(null); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Time for: {b.title}</DialogTitle>
          <DialogDescription>
            {b.kind === "focus" ? "Focus block starting now." :
             b.kind === "workout" ? "Workout block starting now." :
             b.kind === "mobility" ? "Mobility block starting now." :
             b.kind === "meeting" ? "Meeting starting now." :
             "Scheduled block starting now."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 text-sm">
          {b.start}–{b.end}
          {b.task_id ? <div className="text-muted-foreground">Task: #{b.task_id}</div> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {b.kind === "focus" && (
            <Button onClick={() => startFocus(b)}>Start Focus</Button>
          )}
          {b.kind === "mobility" && (
            <Button onClick={() => startFocus({ ...b, title: "Mobility - 2 min" })}>
              Open Mobility
            </Button>
          )}
          <Button variant="secondary" onClick={() => snooze(b, 5)}>Snooze 5m</Button>
          <Button variant="outline" onClick={() => setDue(null)}>Dismiss</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
