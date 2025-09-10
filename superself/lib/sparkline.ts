// lib/sparkline.ts
import type { ChallengeState, DayProgress } from "./types";

function sumSessionMinutes(d: DayProgress): number {
  if (d.sessions && d.sessions.length > 0) {
    return d.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
  }
  return d.habitMinutes ?? 0;
}

export function minutesByDayMap(state: ChallengeState): Record<number, number> {
  const map: Record<number, number> = {};
  for (const d of state.days) {
    map[d.day] = (map[d.day] ?? 0) + sumSessionMinutes(d);
  }
  return map;
}

export function getLast7Array(state: ChallengeState, todayDay: number): { day: number; minutes: number }[] {
  const map = minutesByDayMap(state);
  const start = Math.max(1, todayDay - 6);
  const arr: { day: number; minutes: number }[] = [];
  for (let d = start; d <= todayDay; d++) {
    arr.push({ day: d, minutes: map[d] ?? 0 });
  }
  return arr;
}
