"use client";

import { useEffect, useMemo, useState } from "react";
import { format, set } from "date-fns";
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
import { supabase } from "@/lib/supabase";

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
  const [rightDay, setRightDay] = useState<string>("");

  // Normalize overall key; prefer a machine key without spaces
  const goalKey = String(intake?.goal ?? "");
  const isOverall = goalKey === "overall_improvement" || goalKey === "overall improvement";
  const totalDays = 30;
  
  const [selectedDay, setSelectedDay] = useState(1);

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

  // Listen for a custom event (from Navbar mobile menu) to open the MoodCheckin modal
  useEffect(() => {
    function onOpenMood() { setCheckinOpen(true); }
    if (typeof window !== 'undefined') {
      window.addEventListener('openMoodCheckin', onOpenMood as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openMoodCheckin', onOpenMood as EventListener);
      }
    };
  }, []);

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

  // Server-backed days (fetched from Supabase). If available, DayScroller will prefer this list.
  const [serverCompletedDays, setServerCompletedDays] = useState<number[] | null>(null);
  useEffect(() => {
    // Fetch challenge_days for the current user and merge into local state
    let mounted = true;
    (async () => {
      // Load intake early so we don't stay stuck on the loading screen
      const i = loadIntake<Intake>();
      if (mounted) setIntake(i);
      try {
        const { data: rows, error } = await supabase
          .from("challenge_days")
          .select(
            "day_number,completed,credited_to_streak,habit_minutes,sessions,completed_at,date_iso"
          )
          .order("day_number", { ascending: true });
        if (error) {
          console.debug("Supabase fetch challenge_days failed:", error.message);
          return;
        }
        if (!mounted || !rows) return;

        const completed = (rows as any[])
          .filter((r) => r.completed)
          .map((r) => r.day_number as number);
        setServerCompletedDays(completed);

        // Merge server rows into local ChallengeState so derived values use server-backed data
        try {
          const local = loadState<ChallengeState>() ?? initChallengeState();
          // ensure days array exists
          local.days = local.days ?? [];

          for (const r of rows as any[]) {
            const dayNum: number = Number(r.day_number);
            if (!Number.isFinite(dayNum)) continue;
            const existing = local.days.find((d) => d.day === dayNum);
            const dateISO = r.date_iso ? String(r.date_iso) : existing?.dateISO ?? new Date().toISOString().slice(0, 10);
            const sessions = Array.isArray(r.sessions) ? (r.sessions as any[]) : [];
            const completedAtISO = r.completed_at ? new Date(r.completed_at).toISOString() : undefined;
            const credited = typeof r.credited_to_streak === "boolean" ? r.credited_to_streak : existing?.creditedToStreak ?? true;

            if (existing) {
              // Merge server values, prefer server when present
              existing.completed = !!r.completed;
              existing.creditedToStreak = credited;
              existing.habitMinutes = (r.habit_minutes ?? existing.habitMinutes) as number | undefined;
              existing.sessions = sessions.length ? sessions : existing.sessions;
              if (completedAtISO) existing.completedAtISO = completedAtISO;
              existing.dateISO = existing.dateISO ?? dateISO;
            } else {
              local.days.push({
                day: dayNum,
                completed: !!r.completed,
                habitMinutes: r.habit_minutes ?? 0,
                sessions: sessions ?? [],
                dateISO,
                completedAtISO,
                creditedToStreak: credited,
              });
            }
          }

          // Recompute streak using the merged days
          local.streak = computeStreak(local.days);

          // Best-effort: fetch authoritative XP from server so we don't overwrite it
          try {
            const { data: userRes } = await supabase.auth.getUser();
            const userId = userRes?.user?.id;
            const rightday = await supabase
              .from("user_journey")
              .select("created_at")
              .eq("user_id", userId)
              .eq("journey", "30 Day Self Improvement Challenge")
              .single();
            console.log("rightday", rightday.data?.created_at);
            const rightDateISO = rightday.data?.created_at ? rightday.data?.created_at.slice(0,10) : undefined;
            if (rightDateISO) {
              setRightDay(rightDateISO);
              // Use rightDateISO as authoritative startDate for this challenge
              local.startDateISO = rightDateISO;
            }
            if (userId) {
              const { data: lb, error: lbErr } = await supabase
                .from("leaderboards")
                .select("xp_alltime")
                .eq("user_id", userId)
                .single();
              if (!lbErr && lb) {
                const serverXp = Number(lb.xp_alltime ?? 0);
                local.xp = serverXp;
                try {
                  const p = xpProgress(local.xp ?? 0);
                  local.level = p.level;
                } catch (e) {
                  // ignore fetch errors
                  console.debug("Failed to fetch authoritative XP", e);
                }
              }
            }
          } catch (e) {
            // ignore fetch errors
            console.debug("Failed to fetch authoritative XP from server", e);
          }

          // After merging server rows and (optionally) using rightDay as startDate,
          // compute today's day and persist the merged state so derived values use it.
          try {
            const todayDay = computeTodayDay(local.startDateISO);
            local.todayDay = todayDay;
            // Persist merged state and update UI
            saveState(local);
            if (mounted) {
              setState(local);
              setSelectedDay(todayDay);
              if (todayDay === 8 && (!local.tinyHabit || !local.tinyHabit.active)) {
                setPromptOpen(true);
              }
            }
          } catch (e) {
            // fallback: persist without computing todayDay
            saveState(local);
            if (mounted) setState(local);
          }
        } catch (e) {
          console.debug("Failed to merge server challenge_days into local state", e);
        }
      } catch (e) {
        console.debug("Failed to fetch challenge_days", e);
      }
    })();
    return () => { mounted = false };
  }, []);

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
    // Try to persist to Supabase as well (upsert challenge_days row)
    (async () => {
      try {
        const payload = {
          day_number: todayDay,
          date_iso: new Date().toISOString().slice(0, 10),
          completed: true,
          credited_to_streak: true,
          habit_minutes: rec.habitMinutes || 0,
        };
        // Use upsert on unique (user_id, day_number) - server-side policy should set user_id from auth
  const { error } = await supabase.from("challenge_days").upsert([payload], { onConflict: "day_number" });
        if (error) console.debug("Failed to upsert challenge_day", error.message);
        // Refresh server list
        const { data: rows } = await supabase.from("challenge_days").select("day_number,completed").order("day_number", { ascending: true });
        if (rows) {
          const completed = (rows as any[]).filter((r) => r.completed).map((r) => r.day_number as number);
          setServerCompletedDays(completed);
        }
      } catch (e) {
        console.debug("Supabase save failed", e);
      }
    })();
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
    <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-4 overflow-x-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">30‑Day Challenge</h1>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mt-1">
            <p className="truncate">
              Started {format(new Date(rightDay + "T00:00:00"), "MMM d")} · Goal:
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
          completedDays={serverCompletedDays ?? completedDays}
          onPick={(day) => {
            setSelectedDay(day);
            // NEW (optional UX): open preview when a day is picked
            const b = getBriefForDay(day, isOverall ? "overall improvement" : "focus");
            setPreviewBrief(b);
            setPreviewOpen(true);
          }}
        />
      </div>

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
