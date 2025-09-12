import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import type { ChallengeState, DayProgress } from "./types";

export function initChallengeState(startDate?: Date): ChallengeState {
  const start = startOfDay(startDate ?? new Date());
  const dateISO = format(start, "yyyy-MM-dd");
  return {
    startDateISO: dateISO,
    todayDay: 1,
    streak: 0,
    graceUsedThisWeek: 0,
    days: [],
    xp: 0,
    level: 1,
    xpLog: [],
  };
}

export function computeTodayDay(startDateISO: string): number {
  const start = new Date(startDateISO + "T00:00:00");
  const now = startOfDay(new Date());
  const diff = differenceInCalendarDays(now, start);
  return Math.min(30, Math.max(1, diff + 1));
}

export function computeStreak(days: DayProgress[]): number {
  // Count backwards from latest day; stop on first miss
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].completed) streak++;
    else break;
  }
  return streak;
}

export function adherence(days: DayProgress[], uptoDay: number): number {
  const done = days.filter((d) => d.day <= uptoDay && d.completed).length;
  return uptoDay ? Math.round((done / uptoDay) * 100) : 0;
}

export function ensureDay(days: DayProgress[], day: number): DayProgress {
  const dateISO = format(new Date(), "yyyy-MM-dd");
  const existing = days.find((d) => d.day === day);
  if (existing) return existing;
  const created: DayProgress = { day, completed: false, dateISO };
  days.push(created);
  return created;
}
