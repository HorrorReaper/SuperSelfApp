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

export function computeStreak(days: DayProgress[], upToDay?: number): number {
  // Compute the latest consecutive streak ending at `upToDay` (or the most
  // recent day present). We iterate backwards from the end and count
  // consecutive days that are completed and credited to the streak.
  const map = new Map<number, DayProgress>(days.map((d) => [d.day, d]));
  const lastDay = upToDay ?? (days.length ? Math.max(...days.map((d) => d.day)) : 0);
  let count = 0;
  for (let d = lastDay; d >= 1; d--) {
    const rec = map.get(d);
    // missing record or not completed -> streak ends
    if (!rec?.completed) break;
    // explicitly excluded from streak -> streak ends
    if (rec.creditedToStreak === false) break;
    count++;
  }
  // debug helper
  console.log("computeStreak", { lastDay, count });
  return count;
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
