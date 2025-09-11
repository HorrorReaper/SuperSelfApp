import { loadState, saveState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { ensureDay } from "@/lib/compute";

export function saveCompletedSession(day: number, minutes: number, note?: string) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  const d = ensureDay(s.days, day);
  d.sessions = d.sessions ?? [];
  d.sessions.push({
    id: crypto.randomUUID(),
    minutes,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
  });
  // Optionally, sync habitMinutes as a convenience (sum of sessions)
  d.habitMinutes = (d.sessions?.reduce((acc, x) => acc + (x.minutes || 0), 0)) || minutes;
  saveState(s);
}
