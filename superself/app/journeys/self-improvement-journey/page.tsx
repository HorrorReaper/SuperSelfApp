"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressTiles } from "@/components/sichallenge/progress-tiles";
import { ChallengeTodayCard } from "@/components/sichallenge/challenge-today-card";
import { WeeklyRetroCard } from "@/components/sichallenge/weekly-retro-card";
import { loadIntake, loadState, saveState } from "@/lib/local";
import { adherence, computeStreak, computeTodayDay, ensureDay, initChallengeState } from "@/lib/compute";
import type { ChallengeState, Intake } from "@/lib/types";
import { format } from "date-fns";
import { TimerModal } from "@/components/sichallenge/timer-modal";
import { getProgress } from "@/lib/timer";

export default function DashboardPage() {
  const [intake, setIntake] = useState<Intake | null>(null);
  const [state, setState] = useState<ChallengeState | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

function handleStartTimer() {
  setTimerOpen(true);
}

function handleReachedEighty() {
  setCanComplete(true);
}

function handleFinished() {
  setCanComplete(true);
}

  // Load from localStorage
  useEffect(() => {
    const i = loadIntake<Intake>();
    setIntake(i);
    let s = loadState<ChallengeState>();
    if (!s) {
      s = initChallengeState();
      saveState(s);
    }
    setState(s);
  }, []);

  // Derive today/day/adherence/streak
  const derived = useMemo(() => {
    if (!state) return null;
    const todayDay = computeTodayDay(state.startDateISO);
    const dayRec = ensureDay(state.days, todayDay);
    const streak = computeStreak(state.days);
    const adh = adherence(state.days, todayDay);
    return { todayDay, dayRec, streak, adh };
  }, [state]);

  if (!intake || !state || !derived) {
    return (
      <div className="max-w-screen-sm mx-auto p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Loading your challenge…</p>
      </div>
    );
  }

  const { todayDay, dayRec, streak, adh } = derived;

  const targetMinutes = (() => {
    switch (intake.keystoneHabit) {
      case "focus_block":
      case "learning_minutes":
        return 25;
      case "mobility":
        return 5;
      case "steps":
        return 30; // treat as 30 active minutes
      case "lights_down":
      case "planning":
        return 10;
      default:
        return 15;
    }
  })();

  const titleMap: Record<string, string> = {
    focus_block: "25-minute Focus Block",
    learning_minutes: "10 minutes Learning",
    steps: "Daily Movement Goal",
    mobility: "2–5 minute Mobility",
    lights_down: "Lights-Down Hour",
    planning: "5-minute Shutdown/Plan",
  };
  const descMap: Record<string, string> = {
    focus_block: "Silence notifications, one task, run the timer.",
    learning_minutes: "Pick one course or topic and learn without switching.",
    steps: "Get moving—walks, chores, or light cardio count.",
    mobility: "Quick mobility flow. Any space is fine.",
    lights_down: "Dim lights and reduce screens before your sleep window.",
    planning: "Close loops, set tomorrow’s top 1–3 tasks.",
  };

  function markDone() {
    const next = { ...state };
    const rec = ensureDay(next.days, todayDay);
    rec.completed = true;
    rec.habitMinutes = targetMinutes;
    next.streak = computeStreak(next.days);
    next.todayDay = todayDay;
    setState(next);
    saveState(next);
  }

  function startTimer() {
    // Placeholder: integrate your timer modal/page later
    alert(`Start a ${targetMinutes}-minute timer (stub).`);
  }

  const weekIndex = Math.ceil(todayDay / 7);

  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">30‑Day Challenge</h1>
          <p className="text-sm text-muted-foreground">
            Started {format(new Date(state.startDateISO + "T00:00:00"), "MMM d")} · Goal:{" "}
            <Badge variant="secondary" className="align-middle">
              {intake.goal}
            </Badge>{" "}
            · Habit: <Badge className="align-middle">{intake.keystoneHabit}</Badge>
          </p>
        </div>
        <Badge variant="outline">Day {todayDay}/30</Badge>
      </header>

      <ProgressTiles day={todayDay} streak={streak} adherencePct={adh} />

      <ChallengeTodayCard
        title={titleMap[intake.keystoneHabit]}
        description={descMap[intake.keystoneHabit]}
        targetMinutes={targetMinutes}
        completed={!!dayRec.completed}
        onStart={handleStartTimer}
        onComplete={markDone}
        canComplete={canComplete || !!dayRec.completed}
      />

      <TimerModal
        open={timerOpen}
        onOpenChange={setTimerOpen}
        defaultMinutes={targetMinutes}
        onReachedEighty={handleReachedEighty}
        onFinished={handleFinished}
      />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Hit your habit at least 5 days. You have {intake.graceDay ? 1 : 0} grace day per week.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => alert("Open schedule (stub)")}>
              Schedule tomorrow
            </Button>
            <Button variant="ghost" onClick={() => alert("Open notes (stub)")}>
              Add note
            </Button>
          </div>
        </CardContent>
      </Card>

      {todayDay % 7 === 0 ? (
        <WeeklyRetroCard weekIndex={weekIndex} onOpen={() => alert("Open weekly retro (stub)")} />
      ) : null}
    </div>
  );
}
