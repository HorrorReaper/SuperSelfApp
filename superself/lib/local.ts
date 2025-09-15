const INTAKE_KEY = "challenge:intake";
const STATE_KEY = "challenge:state";

export function saveIntake(intake: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTAKE_KEY, JSON.stringify(intake));
}
export function loadIntake<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(INTAKE_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

import { mirrorProfileFromState } from "./local-sync";
import type { ChallengeState, TinyHabitCompletion, TinyHabitConfig } from "./types";

export function loadState<T = ChallengeState>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STATE_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}
/*export function saveState(state: ChallengeState) {
  if (typeof window === "undefined") {return;};
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}*/
export const STATE_UPDATED_EVENT = "challenge:state-updated";
export function saveState(state: ChallengeState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    // Notify same‑tab listeners (cross‑tab updates already trigger "storage")
    mirrorProfileFromState(state);
    window.dispatchEvent(new CustomEvent(STATE_UPDATED_EVENT));
  } catch (err) {
    // Optional: log or handle quota errors
    console.error("saveState failed", err);
  }
}
export function setTinyHabit(cfg: TinyHabitConfig) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  s.tinyHabit = cfg;
  s.tinyHabitCompletions = s.tinyHabitCompletions ?? [];
  saveState(s);
}

export function completeTinyHabit(day: number, done: boolean, minutes?: number, note?: string) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  s.tinyHabitCompletions = s.tinyHabitCompletions ?? [];
  const existing = s.tinyHabitCompletions.find((x) => x.day === day);
  if (existing) {
    existing.done = done;
    existing.minutes = minutes ?? existing.minutes;
    existing.note = note ?? existing.note;
  } else {
    s.tinyHabitCompletions.push({ day, done, minutes, note });
  }
  saveState(s);
}

