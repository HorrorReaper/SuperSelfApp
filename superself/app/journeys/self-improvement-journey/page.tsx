"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProgressTiles } from "@/components/sichallenge/progress-tiles";
import { ChallengeTodayCard } from "@/components/sichallenge/challenge-today-card";
import { WeeklyRetroModal } from "@/components/sichallenge/weekly-retro-modal";
import { MicroBriefCard } from "@/components/sichallenge/micro-brief-card";
import { TinyHabitPrompt } from "@/components/sichallenge/tiny-habit-prompt";
import { TinyHabitCard } from "@/components/sichallenge/tiny-habit-card";
import { getLast7Array } from "@/lib/sparkline";
import { MinutesSparklineCard } from "@/components/sichallenge/minutes-sparkline-card";
import { MiniTimerWidget } from "@/components/sichallenge/mini-timer-widget";
import { saveCompletedSession } from "@/lib/sessions";
import { loadTimer, getProgress } from "@/lib/timer";

import { loadIntake, loadState, saveState } from "@/lib/local";
import { adherence, computeStreak, computeTodayDay, ensureDay, initChallengeState } from "@/lib/compute";
import { getBriefForDay } from "@/lib/brief";
import { completeTinyHabit, setTinyHabit } from "@/lib/local";

import type { ChallengeState, Intake } from "@/lib/types";
import { TimerModal } from "@/components/sichallenge/timer-modal";
import { OverallDailyChallenge } from "@/components/sichallenge/overall-daily-challenge";

export default function DashboardPage() {
  const [intake, setIntake] = useState<Intake | null>(null);
  const [state, setState] = useState<ChallengeState | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [retroOpen, setRetroOpen] = useState(false);

  useEffect(() => {
    const i = loadIntake<Intake>();
    setIntake(i);
    let s = loadState<ChallengeState>();
    if (!s) {
      s = initChallengeState();
      saveState(s);
    }
    // Compute today and decide on prompt
    const todayDay = computeTodayDay(s.startDateISO);
    s.todayDay = todayDay;
    saveState(s);
    setState(s);

    // Open tiny habit prompt if Day 8 and no tiny habit selected
    if (todayDay === 8 && (!s.tinyHabit || !s.tinyHabit.active)) {
      setPromptOpen(true);
    }
  }, []);
  useEffect(() => {
    // Auto-open on week boundary
    if (state?.todayDay && state.todayDay % 7 === 0) {
      setRetroOpen(true);
    }
  }, [state?.todayDay]);

  const derived = useMemo(() => {
    if (!state) return null;
    const todayDay = state.todayDay;
    const dayRec = ensureDay(state.days, todayDay);
    const streak = computeStreak(state.days);
    const adh = adherence(state.days, todayDay);
    return { todayDay, dayRec, streak, adh };
  }, [state]);
  const last7 = useMemo(() => (state ? getLast7Array(state, derived?.todayDay ?? state.todayDay) : []), [state, derived?.todayDay]);

  if (!intake || !state || !derived) {
    return (
      <div className="max-w-screen-sm mx-auto p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Loading…</p>
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
        return 30;
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
  const next: ChallengeState = { ...(state as ChallengeState) };
    const rec = ensureDay(next.days, todayDay);
    rec.completed = true;
    // Ensure habitMinutes mirrors actual sum
    const total = (rec.sessions ?? []).reduce((a, s) => a + (s.minutes || 0), 0);
    rec.habitMinutes = total; // don’t cap at target
    next.streak = computeStreak(next.days);
    setState(next);
    saveState(next);
  }
  function handleActionButton() {
    if (intake.goal === "focus") {
      handleStartTimer();
    } else {
      alert("Action button stub for non-focus goal");
      // TODO: Implement non-focus action
    }
  }

  function handleStartTimer() {
  setSessionSaved(false);
  setTimerOpen(true);
  }

  function handleReachedEighty() {
    setCanComplete(true);
  }

  function handleFinished() {
    setCanComplete(true);
    // Save the session with actual elapsed minutes
    const { elapsed } = getProgress();
    const minutes = Math.max(1, Math.round(elapsed / 60));
    saveCompletedSession(derived?.todayDay ?? state!.todayDay, minutes);
    setSessionSaved(true);
  }

  function handleTimerOpenChange(open: boolean) {
    setTimerOpen(open);
    // On close, persist a partial session if at least 1 minute elapsed and not saved yet
    if (!open) {
      const { elapsed } = getProgress();
      const minutes = Math.floor(elapsed / 60);
      if (minutes >= 1 && !sessionSaved) {
        saveCompletedSession(derived?.todayDay ?? state!.todayDay, minutes);
        setSessionSaved(true);
      }
    }
  }

  function handleTinySelect(type: "timeboxing" | "lights_down" | "mobility") {
    setTinyHabit({ type, startedOnDay: todayDay, active: true });
    const s = loadState<ChallengeState>();
    if (s) setState(s);
    setPromptOpen(false);
  }

  function handleTinySkip() {
    setPromptOpen(false);
  }

  // Tiny habit completion for today
  const tiny = state.tinyHabit?.active ? state.tinyHabit : null;
  const tinyDone =
    state.tinyHabitCompletions?.find((x) => x.day === todayDay)?.done ?? false;

  function handleTinyComplete(done: boolean) {
    completeTinyHabit(todayDay, done);
    const s = loadState<ChallengeState>();
    if (s) setState(s);
  }

  // Micro brief only for days 1..7
  const brief = todayDay <= 7 ? getBriefForDay(todayDay, intake.goal) : null;

  

  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">30‑Day Challenge</h1>
          <div className="flex">
          <p className="text-sm text-muted-foreground">
            Started {format(new Date(state.startDateISO + "T00:00:00"), "MMM d")} · Goal:{" "}</p>
            <Badge variant="secondary" className="align-middle">
              {intake.goal}
            </Badge>{" "}
            {intake.goal === "overall improvement" ? null :(<div><p className="text-sm text-muted-foreground">
            · Habit: </p><Badge className="align-middle">{intake.keystoneHabit}</Badge></div>)}
          </div>
        </div>
        <Badge variant="outline">Day {todayDay}/30</Badge>
      </header>

      <ProgressTiles day={todayDay} streak={streak} adherencePct={adh} />

      {brief && intake.goal === "focus" ? (
        <MicroBriefCard
          title={brief.title}
          tldr={brief.tldr}
          content={brief.content}
          actionLabel={brief.actionLabel}
          onAction={handleActionButton}
          onSkip={handleStartTimer}
        />
      ) : null}
      {intake.goal === "overall improvement" ? (
        <OverallDailyChallenge
    day={derived.todayDay}
    brief={brief}
    onMarkedDone={markDone}
  />):(
      <ChallengeTodayCard
        title={titleMap[intake.keystoneHabit]}
        description={descMap[intake.keystoneHabit]}
        targetMinutes={targetMinutes}
        completed={!!dayRec.completed}
        onStart={handleStartTimer}
        onComplete={markDone}
        canComplete={canComplete || !!dayRec.completed}
      />)}

      {tiny ? (
        <TinyHabitCard
          habitType={tiny.type}
          day={todayDay}
          done={tinyDone}
          onComplete={handleTinyComplete}
        />
      ) : null}

      <Separator />

      

      <TinyHabitPrompt
        open={promptOpen}
        onOpenChange={setPromptOpen}
        onSelect={handleTinySelect}
        onSkip={handleTinySkip}
      />

      {intake.goal==="focus" ? (<TimerModal
        open={timerOpen}
        onOpenChange={handleTimerOpenChange}
        defaultMinutes={targetMinutes}
        onReachedEighty={handleReachedEighty}
        onFinished={handleFinished}
      />) : null}
      <WeeklyRetroModal
        open={retroOpen}
        onOpenChange={setRetroOpen}
        weekIndex={Math.ceil(derived.todayDay / 7)}
        targetMinutesPerDay={targetMinutes}
      />
      
      {intake.goal === "focus" ? (<>
        <MinutesSparklineCard data={last7} />
        <MiniTimerWidget onOpenTimer={() => setTimerOpen(true)} /></>
      ) : null}
    </div>
  );
}
