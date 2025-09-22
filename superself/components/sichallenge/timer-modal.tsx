"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProgress,
  initTimer,
  isComplete,
  loadTimer,
  pauseTimer,
  resetTimer,
  saveTimer,
  startTimer,
  TimerState,
  addTodo,
  toggleTodo,
  deleteTodo,
} from "@/lib/timer";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

async function playSound(src: string) {
  try {
    const audio = new Audio(src);
    await audio.play();
  } catch {}
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMinutes: number;
  onReachedEighty?: () => void;
  onFinished?: () => void;
};

export function TimerModal({ open, onOpenChange, defaultMinutes, onReachedEighty, onFinished }: Props) {
  const [state, setState] = React.useState<TimerState | null>(null);
  const [tick, setTick] = React.useState(0);
  const [minutes, setMinutes] = React.useState(defaultMinutes);
  const [todoText, setTodoText] = React.useState("");

  // Initialize or load the timer when opening
  React.useEffect(() => {
    if (!open) return;
    // Load existing timer (or initialize) and sync minutes state so UI reflects saved target
    let t = loadTimer() ?? initTimer(defaultMinutes * 60);
    // Normalize missing fields from older saves
    if (t && !Array.isArray((t as any).todos)) {
      (t as any).todos = [];
      saveTimer(t as any);
    }
    if (!t.isRunning && t.targetSeconds !== defaultMinutes * 60) {
      resetTimer(defaultMinutes * 60);
      // re-load after reset
      t = loadTimer() ?? initTimer(defaultMinutes * 60);
      if (t && !Array.isArray((t as any).todos)) {
        (t as any).todos = [];
        saveTimer(t as any);
      }
    }
    setState(t);
    // ensure the minutes shown in UI match the targetSeconds of the loaded timer
    setMinutes(Math.round((t?.targetSeconds ?? defaultMinutes * 60) / 60));
    const id = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(id);
  }, [open, defaultMinutes]);

  // Watch progress for callbacks, play beeps
  const notifiedRef = React.useRef({ eighty: false, hundred: false });
  React.useEffect(() => {
    if (!state) return;
    const { elapsed, pct } = getProgress();
    if (pct >= 80 && !notifiedRef.current.eighty) {
      notifiedRef.current.eighty = true;
      playSound("/sounds/chime80.mp3");
      navigator.vibrate?.(100);
      onReachedEighty?.();
    }
    if (elapsed >= (state?.targetSeconds ?? defaultMinutes * 60) && !notifiedRef.current.hundred) {
      notifiedRef.current.hundred = true;
      playSound("/sounds/chime100.mp3");
      navigator.vibrate?.(200);
      onFinished?.();
    }
  }, [tick, state, onReachedEighty, onFinished, defaultMinutes]);

  if (!state) return null;

  const { elapsed, remaining, pct } = getProgress();
  const running = loadTimer()?.isRunning ?? false;
  const quote = state.quote ?? { text: "Make it easy to start today.", author: "", bg: "" };

  function handleStartPause() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) {
      pauseTimer();
    } else {
      startTimer(t.targetSeconds || defaultMinutes * 60);
    }
    setState(loadTimer());
  }

  function handleReset() {
    notifiedRef.current = { eighty: false, hundred: false };
    resetTimer(state?.targetSeconds);
    setState(loadTimer());
  }

  function handleMinutesChange(v: number[]) {
    const newMinutes = v[0];
    setMinutes(newMinutes);

    // Persist immediately if the timer isn't running
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) return; // don't change target while running

    const newState: TimerState = {
      ...t,
      targetSeconds: newMinutes * 60,
    };
    saveTimer(newState);
    setState(newState);
  }

  function handleApplyMinutes() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) return;
    const newState: TimerState = {
      ...t,
      targetSeconds: minutes * 60,
    };
    saveTimer(newState);
    setState(newState);
  }

  function addTodoLocal() {
    const text = todoText.trim();
    if (!text) return;
    addTodo(text);
    setTodoText("");
    setState(loadTimer());
  }

  function toggleTodoLocal(id: string) {
    toggleTodo(id);
    setState(loadTimer());
  }

  function deleteTodoLocal(id: string) {
    deleteTodo(id);
    setState(loadTimer());
  }



  const mmRemaining = formatMMSS(remaining);
  const mmElapsed = formatMMSS(elapsed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogTitle className="sr-only">Focus Timer</DialogTitle>
  <DialogDescription className="sr-only">Use the timer to focus on your challenge.</DialogDescription>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Momentum-style hero */}
        <div
          className="h-36 sm:h-44 relative flex items-end"
          style={{
            backgroundImage: quote.bg ? `url(${quote.bg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative p-4 text-white">
            <div className="text-sm opacity-90">Today’s Focus</div>
            <div className="text-lg font-semibold leading-tight max-w-md">{quote.text}</div>
            {quote.author ? <div className="text-xs opacity-80 mt-1">— {quote.author}</div> : null}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-semibold tabular-nums">{mmRemaining}</div>
              <div className="text-sm text-muted-foreground">Elapsed {mmElapsed}</div>
            </div>
            <Progress value={pct} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">{pct}%</div>
          </div>

          {/* Controls + duration */}
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Target duration</div>
              <div className="text-sm">{minutes} min</div>
            </div>
            <div className="pt-2">
              <Slider value={[minutes]} min={5} max={60} step={5} onValueChange={handleMinutesChange} disabled={running} />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">Adjust in 5-min steps</div>
              </div>
            </div>
          </div>

          {/* Todo list */}
          <div className="rounded-md border">
            <div className="p-3 border-b text-sm font-medium">Todo for this session</div>
            <div className="p-3 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a task…"
                  value={todoText}
                  onChange={(e) => setTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodoLocal()}
                />
                <Button onClick={addTodoLocal}>Add</Button>
              </div>
              <ul className="space-y-2">
                {Array.isArray(state.todos) && state.todos.length === 0 ? (
                  <li className="text-xs text-muted-foreground">Tip: Add 1–3 small tasks to stay focused.</li>
                ) : (
                  (Array.isArray(state.todos) ? state.todos : []).map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <Checkbox checked={t.done} onCheckedChange={() => {toggleTodoLocal(t.id); playSound("/sounds/check.mp3");}} />
                      <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
                      <Button size="icon" variant="ghost" onClick={() => deleteTodoLocal(t.id)} aria-label="Delete">
                        ✕
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Start/Pause/Reset */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleStartPause}>
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={handleReset} disabled={running || elapsed === 0}>
              Reset
            </Button>
            <Button
    className="flex-1"
    variant="ghost"
    onClick={() => {
      // Use current target or minutes shown.
      // The focus page reads state from localStorage,
      // so we just open it in a new tab.
      window.open("/focus", "_blank", "noopener,noreferrer");
    }}
  >
    Open in new tab
  </Button>
          </div>

          {isComplete() ? (
            <div className="rounded-md bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-100 px-3 py-2 text-sm">
              Great job! Close the timer and mark today done.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
