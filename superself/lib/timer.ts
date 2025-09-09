// lib/timer.ts
export type TimerState = {
  targetSeconds: number;
  isRunning: boolean;
  startedAt: number | null; // epoch ms when last started
  accumulatedMs: number; // total completed ms excluding current run
  lastSavedAt: number | null; // for diagnostics
};

const KEY = "challenge:timer";

export function initTimer(targetSeconds: number): TimerState {
  const existing = loadTimer();
  if (existing && existing.targetSeconds === targetSeconds) return existing;
  const fresh: TimerState = {
    targetSeconds,
    isRunning: false,
    startedAt: null,
    accumulatedMs: 0,
    lastSavedAt: Date.now(),
  };
  saveTimer(fresh);
  return fresh;
}

export function loadTimer(): TimerState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as TimerState) : null;
}

export function saveTimer(t: TimerState) {
  if (typeof window === "undefined") return;
  t.lastSavedAt = Date.now();
  localStorage.setItem(KEY, JSON.stringify(t));
}

export function startTimer(targetSeconds: number) {
  const t = loadTimer() ?? initTimer(targetSeconds);
  if (!t.isRunning) {
    t.isRunning = true;
    t.startedAt = Date.now();
    t.targetSeconds = targetSeconds;
    saveTimer(t);
  }
}

export function pauseTimer() {
  const t = loadTimer();
  if (!t) return;
  if (t.isRunning && t.startedAt) {
    t.accumulatedMs += Date.now() - t.startedAt;
    t.isRunning = false;
    t.startedAt = null;
    saveTimer(t);
  }
}

export function resetTimer(targetSeconds?: number) {
  const t: TimerState = {
    targetSeconds: targetSeconds ?? loadTimer()?.targetSeconds ?? 1500,
    isRunning: false,
    startedAt: null,
    accumulatedMs: 0,
    lastSavedAt: Date.now(),
  };
  saveTimer(t);
}

export function getElapsedMs(): number {
  const t = loadTimer();
  if (!t) return 0;
  const runningChunk = t.isRunning && t.startedAt ? Date.now() - t.startedAt : 0;
  return t.accumulatedMs + runningChunk;
}

export function getProgress(): { elapsed: number; remaining: number; pct: number } {
  const t = loadTimer();
  if (!t) return { elapsed: 0, remaining: 0, pct: 0 };
  const elapsedSec = Math.floor(getElapsedMs() / 1000);
  const remaining = Math.max(0, t.targetSeconds - elapsedSec);
  const pct = Math.min(100, Math.round((elapsedSec / t.targetSeconds) * 100));
  return { elapsed: elapsedSec, remaining, pct };
}

export function isComplete(): boolean {
  const t = loadTimer();
  if (!t) return false;
  const { elapsed } = getProgress();
  return elapsed >= t.targetSeconds;
}
