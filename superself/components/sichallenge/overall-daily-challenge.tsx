// components/overall-daily-challenge.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MicroBrief, ChallengeState } from "@/lib/types";
import { OverallActionRunner } from "./overall-action-runner";
import { OVERALL_ACTIONS } from "@/lib/overall-actions";
import { ensureDay } from "@/lib/compute";
import { loadState, saveState } from "@/lib/local";

type Props = {
  day: number;
  brief: MicroBrief;
  onMarkedDone: () => void;
};

export function OverallDailyChallenge({ day, brief, onMarkedDone }: Props) {
  const actionCfg = OVERALL_ACTIONS[day];

  function handleComplete(payload: any) {
    // Save payload to state.days[day]
    const s = loadState<ChallengeState>();
    if (!s) return;
    const rec = ensureDay(s.days, day);
    // Merge notes or attach action payload
    const prev = rec.notes ? rec.notes + "\n" : "";
    const p = typeof payload === "string" ? payload : JSON.stringify(payload);
    rec.notes = `${prev}[Day ${day} action] ${p}`;
    // If timer minutes provided, add as a session
    if (payload?.minutes) {
      rec.sessions = rec.sessions ?? [];
      rec.sessions.push({ id: crypto.randomUUID(), minutes: payload.minutes, startedAt: new Date().toISOString() });
      rec.habitMinutes = (rec.sessions ?? []).reduce((a, s) => a + (s.minutes || 0), 0);
    }
    saveState(s);
    // Enable “Mark done” in parent
    onMarkedDone();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{brief.title}</CardTitle>
        <CardDescription>{brief.tldr}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{brief.content}</p>

        {/* Control question */}
        <div className="rounded-md border p-3">
          <div className="text-sm font-medium mb-2">Control question</div>
          <div className="text-sm text-muted-foreground">{brief.controlquestion}</div>
        </div>

        {/* Action runner */}
        {actionCfg ? (
          <>
            <Separator />
            <div className="text-sm font-medium">{brief.actionLabel}</div>
            <OverallActionRunner day={day} config={actionCfg} onComplete={handleComplete} />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
