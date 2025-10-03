// components/overall-action-runner.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { TimerModal } from "@/components/sichallenge/timer-modal";
import type { DailyActionConfig } from "@/lib/types";
import { getDayActionData, upsertDayActionData } from "@/lib/day-actions";
import { buildICS, downloadICS } from "@/lib/ics";
import PhotoProofUploader from "@/components/shared/PhotoProofUploader";

type Props = {
  day: number;
  config: DailyActionConfig;
  onComplete: (payload: unknown) => void; // keep for gating “Mark day complete"
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

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
    setSaveStatus("saved");
    // Only signal completion to parent when all items are done
    if (next.length > 0 && next.every((c) => c.done)) {
      onComplete({ checklistDone: true, items: next });
    }
  }

  // Removed manual save; autosave happens on toggle

  function saveTextAndComplete() {
    persistText(text);
    onComplete({ text });
  }

  function saveToggleAndComplete(nextValue?: boolean) {
    const v = typeof nextValue === "boolean" ? nextValue : toggleDone;
    persistToggle(v);
    onComplete({ done: v });
  }
  function ScheduleBlock({ day, scheduleTemplate }: { day: number; scheduleTemplate: { title: string; durationMinutes: number; when: "tomorrow" | "today" | string; location?: string; description?: string } }) {
  const data = getDayActionData(day);
  const scheduled = !!data?.scheduled;

  function handleAddToCalendar() {
    // For MVP, if "when" is "tomorrow" set start to tomorrow 9:00 AM local
    const base = new Date();
    if (scheduleTemplate.when === "tomorrow") {
      base.setDate(base.getDate() + 1);
    }
    // Default 09:00
    base.setHours(9, 0, 0, 0);
    const ics = buildICS({
      title: scheduleTemplate.title || "SuperSelf Deep Work",
      description: scheduleTemplate.description || "Scheduled by SuperSelf",
      location: scheduleTemplate.location,
      start: base,
      durationMinutes: scheduleTemplate.durationMinutes ?? 60,
    });
    downloadICS(scheduleTemplate.title || "superself", ics);
    // Mark scheduled in local state
    upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), kind: "schedule", scheduled: true }));
  }

  return (
    <div className="rounded-md border p-4 space-y-2">
      <div className="text-sm text-muted-foreground">Calendar</div>
      <div className="font-medium">{scheduleTemplate.title}</div>
      <div className="text-sm">Duration: {scheduleTemplate.durationMinutes} min • When: {scheduleTemplate.when}</div>
      <button
        onClick={handleAddToCalendar}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
        disabled={scheduled}
      >
        {scheduled ? "Added to calendar ✓" : "Add to calendar (.ics)"}
      </button>
    </div>
  );
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
          <div className="text-xs text-muted-foreground">
            {checklist.length > 0 && checklist.every((c) => c.done)
              ? "All steps completed 097 You can mark the day complete."
              : saveStatus === "saved"
              ? "Saved"
              : ""}
          </div>
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
      return <ScheduleBlock day={day} scheduleTemplate={config.scheduleTemplate!} />;

    case "photo":
      return (
        <PhotoProofUploader
          day={day}
          label="Add optional proof photo"/>
      );

    default:
      return null;
  }
}

