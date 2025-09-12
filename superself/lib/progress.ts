// lib/progress.ts
import { loadState, saveState } from "@/lib/local";
import { ensureDay } from "@/lib/compute";
import type { ChallengeState } from "@/lib/types";

export function setDayCompleted(day: number, completed: boolean) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  const rec = ensureDay(s.days, day);
  rec.completed = completed;
  saveState(s);
}

export function getDayCompleted(day: number): boolean {
  const s = loadState<ChallengeState>();
  if (!s) return false;
  const rec = s.days.find((d) => d.day === day);
  return !!rec?.completed;
}
