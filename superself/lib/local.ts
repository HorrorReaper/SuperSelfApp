const INTAKE_KEY_BASE = "challenge:intake";
const STATE_KEY_BASE = "challenge:state";

// Runtime-selected active keys (set by ensureNamespacedLocalState when user is known).
declare global {
  interface Window {
    __challenge_state_key?: string;
    __challenge_intake_key?: string;
  }
}

function getActiveStateKey() {
  return window?.__challenge_state_key ?? STATE_KEY_BASE;
}

function getActiveIntakeKey() {
  return window?.__challenge_intake_key ?? INTAKE_KEY_BASE;
}

import { supabase } from "./supabase";

/**
 * Ensure local storage is namespaced for the currently authenticated user.
 * If unauthenticated, no change is made. If a legacy global key exists and the
 * user-specific key does not, the global value will be migrated to the
 * user-specific key and the global key will be removed.
 */
export async function ensureNamespacedLocalState() {
  if (typeof window === "undefined") return;
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) return;

    const stateKey = `${STATE_KEY_BASE}:${userId}`;
    const intakeKey = `${INTAKE_KEY_BASE}:${userId}`;

    // Migrate state
    try {
      const existing = window.localStorage.getItem(stateKey);
      if (!existing) {
        const legacy = window.localStorage.getItem(STATE_KEY_BASE);
        if (legacy) {
          window.localStorage.setItem(stateKey, legacy);
          window.localStorage.removeItem(STATE_KEY_BASE);
        }
      }
    } catch (e) {
      // ignore
    }

    // Migrate intake
    try {
      const existingIntake = window.localStorage.getItem(intakeKey);
      if (!existingIntake) {
        const legacy = window.localStorage.getItem(INTAKE_KEY_BASE);
        if (legacy) {
          window.localStorage.setItem(intakeKey, legacy);
          window.localStorage.removeItem(INTAKE_KEY_BASE);
        }
      }
    } catch (e) {
      // ignore
    }

    // Mark active keys for synchronous helpers
    window.__challenge_state_key = stateKey;
    window.__challenge_intake_key = intakeKey;
  } catch (err) {
    // best-effort: ignore
    console.debug("ensureNamespacedLocalState failed", err);
  }
}

export function saveIntake<T = unknown>(intake: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getActiveIntakeKey(), JSON.stringify(intake));
  } catch (err: unknown) {
    console.debug("saveIntake failed", err);
  }
}
export function loadIntake<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(getActiveIntakeKey());
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err: unknown) {
    console.debug("loadIntake JSON parse failed", err);
    return null;
  }
}

import { mirrorProfileFromState } from "./local-sync";
import { initChallengeState } from "./compute";
import type { ChallengeState, TinyHabitCompletion, TinyHabitConfig } from "./types";
import { upsertTinyHabitForUser } from "./tiny-habits";

export function loadState<T = ChallengeState>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(getActiveStateKey());
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
    localStorage.setItem(getActiveStateKey(), JSON.stringify(state));
    // Notify same‑tab listeners (cross‑tab updates already trigger "storage")
    mirrorProfileFromState(state); // best-effort async mirror to server
    window.dispatchEvent(new CustomEvent(STATE_UPDATED_EVENT));
  } catch (err: unknown) {
    // Optional: log or handle quota errors
    if (err instanceof Error) console.error("saveState failed", err.message);
    else console.error("saveState failed", err);
  }
}
export function setTinyHabit(cfg: TinyHabitConfig) {
  const s = loadState<ChallengeState>();
  const state = s ?? initChallengeState();
  state.tinyHabit = cfg;
  state.tinyHabitCompletions = state.tinyHabitCompletions ?? [];
  saveState(state);
  // Best-effort: persist selection to server immediately
  (async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      await upsertTinyHabitForUser(userId, "30 Day Self Improvement Challenge", state.tinyHabit ?? null, state.tinyHabitCompletions ?? null);
    } catch (err: unknown) {
      console.debug("setTinyHabit: server upsert failed (best-effort)", err);
    }
  })();
}

export function completeTinyHabit(day: number, done: boolean, minutes?: number, note?: string) {
  const s = loadState<ChallengeState>() ?? initChallengeState();
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
  // Best-effort: persist completions to server immediately
  (async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      await upsertTinyHabitForUser(userId, "30 Day Self Improvement Challenge", s.tinyHabit ?? null, s.tinyHabitCompletions ?? null); // pass full array 
    } catch (err: unknown) {
      console.debug("completeTinyHabit: server upsert failed (best-effort)", err);
    }
  })();
}

