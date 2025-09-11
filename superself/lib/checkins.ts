// lib/checkins.ts
import { loadState, saveState } from "@/lib/local";
import { ensureDay } from "@/lib/compute";
import type { ChallengeState, MoodLevel } from "@/lib/types";

export function saveDailyCheckin(day: number, mood: MoodLevel, note?: string) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  // Attach to day record and a global checkins array
  const d = ensureDay(s.days, day);
  // Save mood/energy proxy on day
  const moodScore = moodToScore(mood);
  d.mood = moodScore; // keep your existing 1..5 scale if used elsewhere
  // Store a checkins array on state
  (s as any).checkins = (s as any).checkins ?? [];
  (s as any).checkins.push({
    day,
    mood,
    note,
    createdAtISO: new Date().toISOString(),
  });
  saveState(s);
}

export function hasCheckinFor(day: number): boolean {
  const s = loadState<ChallengeState>() as any;
  const arr = s?.checkins as { day: number }[] | undefined;
  return !!arr?.some((c) => c.day === day);
}

export function moodToScore(m: MoodLevel): number {
  // Map to 1..5 for legacy fields
  switch (m) {
    case "terrible":
      return 1;
    case "not_really":
      return 2;
    case "normal":
      return 3;
    case "good":
      return 4;
    case "super":
      return 5;
    default:
      return 3;
  }
}
