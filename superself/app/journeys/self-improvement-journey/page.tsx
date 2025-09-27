"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { WeeklyRetroModal } from "@/components/sichallenge/weekly-retro-modal";
import { TinyHabitPrompt } from "@/components/sichallenge/tiny-habit-prompt";
import { TinyHabitCard } from "@/components/sichallenge/tiny-habit-card";
import { MinutesSparklineCard } from "@/components/sichallenge/minutes-sparkline-card";
import { MiniTimerWidget } from "@/components/sichallenge/mini-timer-widget";
import { TimerModal } from "@/components/sichallenge/timer-modal";

import { StreakHero } from "@/components/sichallenge/newUI/streak-hero";
import { DayScroller } from "@/components/sichallenge/newUI/day-scroller";
import { DayPreviewSheet } from "@/components/sichallenge/newUI/day-preview-sheet";

import { ChallengeTodayCard } from "@/components/sichallenge/challenge-today-card";
import { MicroBriefCard } from "@/components/sichallenge/micro-brief-card";
import { OverallDailyChallenge } from "@/components/sichallenge/overall-daily-challenge";

import { getLast7Array } from "@/lib/sparkline";
import { saveCompletedSession } from "@/lib/sessions";
import { getProgress } from "@/lib/timer";

import { loadIntake, loadState, saveState, completeTinyHabit, setTinyHabit } from "@/lib/local";
import { adherence, computeStreak, computeTodayDay, ensureDay, initChallengeState } from "@/lib/compute";

import type { ChallengeState, Intake, MicroBrief } from "@/lib/types";

import { MoodCheckinModal } from "@/components/dashboard/mood-checkin-modal";
import { saveDailyCheckin, hasCheckinFor } from "@/lib/checkins";
import type { MoodLevel } from "@/lib/types";

// Briefs
import { getBriefForDay } from "@/lib/brief";
import { awardForDayCompletion } from "@/lib/gamification";
import { toast } from "sonner";
import { xpProgress } from "@/lib/gamification";

export default function DashboardPage() {
  const [intake, setIntake] = useState<Intake | null>(null);
  const [state, setState] = useState<ChallengeState | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const [timerOpen, setTimerOpen] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

  const [promptOpen, setPromptOpen] = useState(false);
  const [retroOpen, setRetroOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBrief, setPreviewBrief] = useState<MicroBrief | null>(null);

  // Normalize overall key; prefer a machine key without spaces
  const goalKey = String(intake?.goal ?? "");
  const isOverall = goalKey === "overall_improvement" || goalKey === "overall improvement";
  const totalDays = 30;
  
  const [selectedDay, setSelectedDay] = useState(1);
  useEffect(() => {
    const i = loadIntake<Intake>();
    setIntake(i);
    let s = loadState<ChallengeState>();
    if (!s) {
      s = initChallengeState();
      saveState(s);
    }
    const todayDay = computeTodayDay(s.startDateISO);
    s.todayDay = todayDay;
    saveState(s);
    setState(s);
    setSelectedDay(todayDay);

    if (todayDay === 8 && (!s.tinyHabit || !s.tinyHabit.active)) {
      setPromptOpen(true);
    }
  }, []);

  useEffect(() => {
    if (state?.todayDay && state.todayDay % 7 === 0) {
      const weekIndex = Math.ceil(state.todayDay / 7);
      const savedWeeks: number[] = (state as any).retrosSaved ?? [];
      if (!savedWeeks.includes(weekIndex)) {
        setRetroOpen(true);
      }
    }
    if (!state) return;
    const todayDay = state.todayDay;
    // Auto-open if not checked in yet
    if (!hasCheckinFor(todayDay)) {
      setTimeout(() => setCheckinOpen(true), 400); // slight delay for nicer UX
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
  const completedDays = useMemo(
     () => state?.days?.filter((d) => d.completed).map((d) => d.day) ?? [],
     [state?.days]
   );

  if (!intake || !state || !derived) {
    return (
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Loading…</p>
      </div>
    );
  }

  const xp = state.xp ?? 0;
  const xpProg = xpProgress(xp); // { level, inLevel, needed, pct }
  const { todayDay, dayRec, streak, adh } = derived;

  // Sparkline source data for minutes (no hooks here to avoid hook order issues)
  const last7 = getLast7Array(state, todayDay);
  const last7Values = last7.map((d) => d.minutes);

  // Targets by keystone
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
    // Use latest persisted state to avoid clobbering autosaved actionData
    const latest = loadState<ChallengeState>() ?? (state as ChallengeState);
    const next: ChallengeState = { ...latest };
    const rec = ensureDay(next.days, todayDay);
    rec.completed = true;
    const total = (rec.sessions ?? []).reduce((a, s) => a + (s.minutes || 0), 0);
    rec.habitMinutes = total;
    next.streak = computeStreak(next.days);
    setState(next);
    saveState(next);
    const { gained, levelUp, newLevel } = awardForDayCompletion(todayDay);
    if (gained > 0) {
      toast.success(`+${gained} XP`, { description: `Day ${todayDay} completed` });
    }
    if (levelUp) {
      toast(`Level up!`, { description: `You reached level ${newLevel} 🚀` });
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
    const { elapsed } = getProgress();
    const minutes = Math.max(1, Math.round(elapsed / 60));
    saveCompletedSession(todayDay, minutes);
    setSessionSaved(true);
  }

  function handleTimerOpenChange(open: boolean) {
    setTimerOpen(open);
    if (!open) {
      const { elapsed } = getProgress();
      const minutes = Math.floor(elapsed / 60);
      if (minutes >= 1 && !sessionSaved) {
        saveCompletedSession(todayDay, minutes);
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

  const tiny = state.tinyHabit?.active ? state.tinyHabit : null;
  const tinyDone = state.tinyHabitCompletions?.find((x) => x.day === todayDay)?.done ?? false;
  function handleTinyComplete(done: boolean) {
    completeTinyHabit(todayDay, done);
    const s = loadState<ChallengeState>();
    if (s) setState(s);
  }

  // Called when the weekly retro modal successfully saves a retro for the current week
  function handleRetroSaved() {
    setRetroOpen(false);
    const latest = loadState<ChallengeState>() ?? (state as ChallengeState);
    const next: any = { ...latest };
    const weekIndex = Math.ceil(todayDay / 7);
    next.retrosSaved = next.retrosSaved ?? [];
    if (!next.retrosSaved.includes(weekIndex)) {
      next.retrosSaved.push(weekIndex);
      try {
        saveState(next);
        setState(next);
      } catch (e) {
        console.error("Failed to persist retro saved state", e);
      }
    }
  }

  // Briefs
  const activeBrief: MicroBrief | null = getBriefForDay(
    todayDay,
    isOverall ? "overall improvement" : "focus"
  );

  // Day preview sheet wiring
  function loadBriefFor(day: number): MicroBrief | null {
    return getBriefForDay(day, isOverall ? "overall improvement" : "focus");
  }
  function handlePickDay(day: number) {
    const b = loadBriefFor(day);
    setPreviewBrief(b);
    setPreviewOpen(true);
  }
  function jumpToDay(_day: number) {
    // Optional: implement viewingDay if you want to show another day's content
    setPreviewOpen(false);
  }
  function handleCheckinSubmit(mood: MoodLevel, note?: string) {
    saveDailyCheckin(derived!.todayDay, mood, note);
    // Optionally reflect in UI (e.g., toast or small badge)
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">30‑Day Challenge</h1>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mt-1">
            <p className="truncate">
              Started {format(new Date(state.startDateISO + "T00:00:00"), "MMM d")} · Goal:
            </p>
            <Badge variant="secondary" className="align-middle truncate max-w-xs">
              {intake.goal}
            </Badge>
            {!isOverall && (
              <>
                <p className="text-sm text-muted-foreground">· Habit:</p>
                <Badge className="align-middle">{intake.keystoneHabit}</Badge>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="flex-shrink-0">Day {todayDay}/30</Badge>
          <Button size="sm" variant="ghost" onClick={() => setCheckinOpen(true)} className="w-full sm:w-auto">
            Journal
          </Button>
        </div>
      </header>

  <StreakHero
        day={todayDay}
        streak={streak}
        adherencePct={adh}
        last7={last7Values}
        isOverall={isOverall}
      />

      {/*<DayScroller currentDay={todayDay} onPick={(d) => handlePickDay(d)} />*/}
      <div className="w-full">
        <DayScroller
          totalDays={totalDays}
          todayDay={todayDay}
          selectedDay={selectedDay}
          completedDays={completedDays}
          onPick={(day) => {
            setSelectedDay(day);
            // NEW (optional UX): open preview when a day is picked
            const b = getBriefForDay(day, isOverall ? "overall improvement" : "focus");
            setPreviewBrief(b);
            setPreviewOpen(true);
          }}
        />
      </div>

      {/*<DayPreviewSheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        brief={previewBrief}
        canJump={false}
        onJumpToDay={jumpToDay}
      />*/}
      <DayPreviewSheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        brief={previewBrief}
        todayDay={todayDay}                // NEW
        canCompleteToday={canComplete}     // NEW: same gate you use on today's flow
        onCompleted={() => {
          // optional: refresh local state so completedDays, streak etc. update
          const s = loadState<ChallengeState>();
          if (s) setState(s);
        }}
        canJump={false}
      />

      {/* Brief + Action */}
      {isOverall ? (
        activeBrief && (
          <div className="w-full">
            <OverallDailyChallenge
              day={todayDay}
              brief={activeBrief}
              canComplete={canComplete}
              //onMarkedDone={markDone}
              onMarkedDone={() => setCanComplete(true)}
            />
          </div>
        )
      ) : (
        activeBrief && (
          <div className="w-full">
            <MicroBriefCard
              title={activeBrief.title}
              tldr={activeBrief.tldr}
              content={activeBrief.content}
              actionLabel={activeBrief.actionLabel}
              onAction={handleStartTimer}
              onSkip={handleStartTimer}
            />
          </div>
        )
      )}

      {/* Focus habit OR mark complete */}
      {!isOverall ? (
        <div className="w-full">
          <ChallengeTodayCard
            title={titleMap[intake.keystoneHabit]}
            description={descMap[intake.keystoneHabit]}
            targetMinutes={targetMinutes}
            completed={!!dayRec.completed}
            onStart={handleStartTimer}
            onComplete={markDone}
            canComplete={canComplete || !!dayRec.completed}
          />
        </div>
      ) : null}

      {tiny ? (
        <TinyHabitCard habitType={tiny.type} day={todayDay} done={tinyDone} onComplete={handleTinyComplete} />
      ) : null}

      <Separator />

      <TinyHabitPrompt open={promptOpen} onOpenChange={setPromptOpen} onSelect={handleTinySelect} onSkip={handleTinySkip} />

      {!isOverall && (
        <div className="space-y-3 w-full">
          <TimerModal
            open={timerOpen}
            onOpenChange={handleTimerOpenChange}
            defaultMinutes={targetMinutes}
            onReachedEighty={handleReachedEighty}
            onFinished={handleFinished}
          />
          <MinutesSparklineCard data={last7} />
          <MiniTimerWidget onOpenTimer={() => setTimerOpen(true)} />
        </div>
      )}

      <WeeklyRetroModal
        open={retroOpen}
        onOpenChange={setRetroOpen}
        weekIndex={Math.ceil(todayDay / 7)}
        targetMinutesPerDay={targetMinutes}
        onSaved={handleRetroSaved}
      />
      <MoodCheckinModal
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        onSubmit={handleCheckinSubmit}
      />
    </div>
  );
}
