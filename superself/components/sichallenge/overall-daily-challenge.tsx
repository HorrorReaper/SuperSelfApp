"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MicroBrief, ChallengeState } from "@/lib/types";
import { OverallActionRunner } from "./overall-action-runner";
import { OVERALL_ACTIONS } from "@/lib/overall-actions";
import { ensureDay } from "@/lib/compute";
import { loadState, saveState } from "@/lib/local";
import { CompleteDayButton } from "../shared/CompleteDayButton";
import Link from "next/link";

type Props = {
  day: number;
  brief: MicroBrief;
  canComplete: boolean;       // NEW: boolean gate
  onMarkedDone: () => void;   // called by action runner when action is done
};

export function OverallDailyChallenge({ day, brief, canComplete, onMarkedDone }: Props) {
  const actionCfg = OVERALL_ACTIONS[day];

  function handleComplete(payload: unknown) {
    const s = loadState<ChallengeState>();
    if (!s) return;
    const rec = ensureDay(s.days, day);

  const prev = rec.notes ? rec.notes + "\n" : "";
  const p = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
    rec.notes = `${prev}[Day ${day} action] ${p}`;

    // If payload contains minutes (timer action), add session
  const maybeMinutes = (payload && typeof payload === "object") ? (payload as Record<string, unknown>)["minutes"] : undefined;
  if (typeof maybeMinutes === "number") {
      rec.sessions = rec.sessions ?? [];
      rec.sessions.push({ id: crypto.randomUUID(), minutes: maybeMinutes, startedAt: new Date().toISOString() });
      rec.habitMinutes = (rec.sessions ?? []).reduce((a, s) => a + (s.minutes || 0), 0);
    }
    saveState(s);

    // tell parent we can now complete the day
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

        <div className="rounded-md border p-3">
          <div className="text-sm font-medium mb-2">Control question</div>
          <div className="text-sm text-muted-foreground">{brief.controlquestion}</div>
        </div>
        <Link href={`/hubs/learning?day=${day}`} className="text-sm text-primary underline">
              Read more
          </Link>


        {actionCfg ? (
          <>
            <Separator />
            <div className="text-sm font-medium">{brief.actionLabel}</div>
            <OverallActionRunner day={day} config={actionCfg} onComplete={handleComplete} />
          </>
        ) : null}

        {/* The button goes here, gated by canComplete */}
          <div className="flex items-center gap-3">
            <CompleteDayButton
              day={day}
              enabled={true}
              onChange={(completed) => {
                if (completed) onMarkedDone();
              }}
            />
            
          </div>
      </CardContent>
    </Card>
  );
}
