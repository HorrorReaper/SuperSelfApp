import { loadState, saveState } from "@/lib/local";
import { ensureDay } from "@/lib/compute";
import type { ChallengeState, DayActionData } from "@/lib/types";

export function getDayActionData(day: number): DayActionData | undefined {
  const s = loadState<ChallengeState>();
  if (!s) return undefined;
  const rec = s.days.find((d) => d.day === day);
  return rec?.actionData;
}

export function upsertDayActionData(day: number, mutator: (prev: DayActionData | undefined) => DayActionData) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  const rec = ensureDay(s.days, day);
  rec.actionData = mutator(rec.actionData);
  saveState(s);
}
