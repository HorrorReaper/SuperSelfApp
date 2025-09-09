export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TimerState = {
  targetSeconds: number;
  isRunning: boolean;
  startedAt: number | null; // epoch ms when last started
  accumulatedMs: number; // total completed ms excluding current run
  lastSavedAt: number | null;
  todos: TodoItem[]; // NEW
  quote?: { text: string; author?: string; bg?: string }; // NEW
};

const KEY = "challenge:timer";

const QUOTES: { text: string; author?: string; bg?: string }[] = [
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", bg: "/quotes/bg1.jpg" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Will Durant", bg: "/quotes/bg2.jpg" },
  { text: "Action is the antidote to anxiety.", author: "Unknown", bg: "/quotes/bg3.jpg" },
];

function pickQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function initTimer(targetSeconds: number): TimerState {
  const existing = loadTimer();
  if (existing && existing.targetSeconds === targetSeconds) return existing;
  const fresh: TimerState = {
    targetSeconds,
    isRunning: false,
    startedAt: null,
    accumulatedMs: 0,
    lastSavedAt: Date.now(),
    todos: [],
    quote: pickQuote(),
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
    if (!t.quote) t.quote = pickQuote(); // ensure we have one
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
    todos: [],
    quote: pickQuote(),
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
  const pct = t.targetSeconds > 0 ? Math.min(100, Math.round((elapsedSec / t.targetSeconds) * 100)) : 0;
  return { elapsed: elapsedSec, remaining, pct };
}

export function isComplete(): boolean {
  const t = loadTimer();
  if (!t) return false;
  const { elapsed } = getProgress();
  return elapsed >= t.targetSeconds;
}

// Todo helpers
export function addTodo(text: string) {
  const t = loadTimer();
  if (!t) return;
  const item = { id: crypto.randomUUID(), text, done: false };
  t.todos.push(item);
  saveTimer(t);
  return item;
}

export function toggleTodo(id: string) {
  const t = loadTimer();
  if (!t) return;
  t.todos = t.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  saveTimer(t);
}

export function deleteTodo(id: string) {
  const t = loadTimer();
  if (!t) return;
  t.todos = t.todos.filter((todo) => todo.id !== id);
  saveTimer(t);
}
