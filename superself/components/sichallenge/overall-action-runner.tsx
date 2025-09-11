"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TimerModal } from "@/components/sichallenge/timer-modal";
import type { DailyActionConfig } from "@/lib/types";

type Props = {
  day: number;
  config: DailyActionConfig;
  onComplete: (payload: any) => void; // store in DayProgress.notes/proofs/sessions
  defaultMinutes?: number; // fallback for timer
};

export function OverallActionRunner({ day, config, onComplete, defaultMinutes = 25 }: Props) {
  const [openTimer, setOpenTimer] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [answers, setAnswers] = useState({ text: "" });
  const [done, setDone] = useState(false);

  // Setup initial checklist if provided
  useState(() => {
    if (config.checklistItems) setChecklist(config.checklistItems.map((s) => `[] ${s}`));
  });

  function renderBody() {
    switch (config.kind) {
      case "timer":
        return (
          <div className="space-y-2">
            <Button onClick={() => setOpenTimer(true)}>Start timer ({config.targetMinutes ?? defaultMinutes} min)</Button>
          </div>
        );
      case "checklist":
        return (
          <div className="space-y-2">
            {config.checklistItems?.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox id={`c-${i}`} onCheckedChange={(v) => v && setDone(true)} />
                <label htmlFor={`c-${i}`} className="text-sm">{label}</label>
              </div>
            ))}
            <Button onClick={() => onComplete({ checklistDone: true })}>Save checklist</Button>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your answer…"
              value={answers.text}
              onChange={(e) => setAnswers({ text: e.target.value })}
            />
            <Button disabled={config.requireAnswer && !answers.text.trim()} onClick={() => onComplete({ text: answers.text })}>
              Save reflection
            </Button>
          </div>
        );
      case "schedule":
        return (
          <div className="space-y-2">
            <Button onClick={() => {
              // For MVP: open Google Calendar prefilled link or download ICS
              alert("Schedule stub: open calendar prefill");
              onComplete({ scheduled: true });
            }}>
              Schedule {config.scheduleTemplate?.title ?? "session"}
            </Button>
          </div>
        );
      case "toggle":
        return (
          <div className="flex items-center gap-3">
            <Checkbox checked={done} onCheckedChange={(v) => setDone(Boolean(v))} />
            <Button disabled={!done} onClick={() => onComplete({ done: true })}>Mark done</Button>
          </div>
        );
      case "photo":
        return (
          <div className="space-y-2">
            <Button onClick={() => alert("Photo proof stub (add uploader later)")}>Add photo proof</Button>
            <Button onClick={() => onComplete({ photoProof: true })}>Save</Button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="rounded-md border p-3">
      {renderBody()}
      {config.kind === "timer" && (
        <TimerModal
          open={openTimer}
          onOpenChange={setOpenTimer}
          defaultMinutes={config.targetMinutes ?? defaultMinutes}
          onFinished={() => {
            setOpenTimer(false);
            onComplete({ timerFinished: true, minutes: config.targetMinutes ?? defaultMinutes });
          }}
        />
      )}
    </div>
  );
}
