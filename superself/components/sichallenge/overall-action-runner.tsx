// components/overall-action-runner.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { TimerModal } from "@/components/sichallenge/timer-modal";
import type { DailyActionConfig } from "@/lib/types";
import { getDayActionData, upsertDayActionData } from "@/lib/day-actions";

type Props = {
  day: number;
  config: DailyActionConfig;
  onComplete: (payload: any) => void; // keep for gating “Mark day complete”
  defaultMinutes?: number;
};

export function OverallActionRunner({ day, config, onComplete, defaultMinutes = 25 }: Props) {
  // Rehydrate from persisted state
  const [checklist, setChecklist] = useState<{ label: string; done: boolean }[]>(
    []
  );
  const [text, setText] = useState("");
  const [toggleDone, setToggleDone] = useState(false);
  const [openTimer, setOpenTimer] = useState(false);

  // Load any saved actionData and merge with config on mount
  useEffect(() => {
    const saved = getDayActionData(day);
    if (config.kind === "checklist") {
      const labels = config.checklistItems ?? [];
      const savedMap = new Map(
        (saved?.checklist ?? []).map((c) => [c.label, c.done])
      );
      const merged = labels.map((label) => ({
        label,
        done: savedMap.get(label) ?? false,
      }));
      setChecklist(merged);
    }
    if (config.kind === "text") {
      setText(saved?.text ?? "");
    }
    if (config.kind === "toggle") {
      setToggleDone(saved?.toggleDone ?? false);
    }
  }, [day, config]);

  // Persist helpers
  function persistChecklist(next: { label: string; done: boolean }[]) {
    upsertDayActionData(day, (prev) => ({
      ...(prev ?? {}),
      kind: "checklist",
      checklist: next,
    }));
  }
  function persistText(next: string) {
    upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), kind: "text", text: next }));
  }
  function persistToggle(next: boolean) {
    upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), kind: "toggle", toggleDone: next }));
  }

  // UI handlers
  function toggleChecklist(i: number) {
    const next = checklist.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c));
    setChecklist(next);
    persistChecklist(next);
  }

  function saveChecklistAndComplete() {
    persistChecklist(checklist);
    onComplete({ checklistDone: checklist.every((c) => c.done), items: checklist });
  }

  function saveTextAndComplete() {
    persistText(text);
    onComplete({ text });
  }

  function saveToggleAndComplete(nextValue?: boolean) {
    const v = typeof nextValue === "boolean" ? nextValue : toggleDone;
    persistToggle(v);
    onComplete({ done: v });
  }

  // Render per kind
  switch (config.kind) {
    case "checklist":
      return (
        <div className="space-y-2">
          {checklist.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <Checkbox checked={c.done} onCheckedChange={() => toggleChecklist(i)} />
              <span className={c.done ? "line-through text-muted-foreground" : ""}>{c.label}</span>
            </div>
          ))}
          <Button onClick={saveChecklistAndComplete}>Save checklist</Button>
        </div>
      );

    case "text":
      return (
        <div className="space-y-2">
          <Textarea
            placeholder="Write your answer…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => persistText(text)} // persist on blur too
          />
          <Button onClick={saveTextAndComplete} disabled={!text.trim()}>
            Save reflection
          </Button>
        </div>
      );

    case "toggle":
      return (
        <div className="flex items-center gap-3">
          <Checkbox
            checked={toggleDone}
            onCheckedChange={(v) => {
              const val = Boolean(v);
              setToggleDone(val);
              persistToggle(val);
            }}
          />
          <Button onClick={() => saveToggleAndComplete()} disabled={!toggleDone}>
            Mark done
          </Button>
        </div>
      );

    case "timer":
      return (
        <>
          <Button onClick={() => setOpenTimer(true)}>
            Start timer ({config.targetMinutes ?? defaultMinutes} min)
          </Button>
          <TimerModal
            open={openTimer}
            onOpenChange={setOpenTimer}
            defaultMinutes={config.targetMinutes ?? defaultMinutes}
            onFinished={() => {
              setOpenTimer(false);
              onComplete({
                timerFinished: true,
                minutes: config.targetMinutes ?? defaultMinutes,
              });
            }}
          />
        </>
      );

    case "schedule":
      return (
        <Button
          onClick={() => {
            // schedule stub
            upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), kind: "schedule", scheduled: true }));
            onComplete({ scheduled: true });
          }}
        >
          {config.scheduleTemplate?.title ?? "Schedule"}
        </Button>
      );

    case "photo":
      return (
        <Button
          onClick={() => {
            // photo stub; wire uploader later
            upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), kind: "photo", photoProof: "stub" }));
            onComplete({ photoProof: true });
          }}
        >
          Add photo proof
        </Button>
      );

    default:
      return null;
  }
}

