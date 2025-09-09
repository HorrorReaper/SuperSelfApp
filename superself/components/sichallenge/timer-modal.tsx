"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // if you have a classnames helper
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
} from "@/lib/timer";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMinutes: number;
  onReachedEighty?: () => void; // notify parent when 80% done
  onFinished?: () => void; // notify when 100% done
};

export function TimerModal({ open, onOpenChange, defaultMinutes, onReachedEighty, onFinished }: Props) {
  const [state, setState] = React.useState<TimerState | null>(null);
  const [tick, setTick] = React.useState(0); // force re-render on interval
  const [minutes, setMinutes] = React.useState(defaultMinutes);

  // Initialize or load the timer when opening
  React.useEffect(() => {
    if (!open) return;
    const t = loadTimer() ?? initTimer(defaultMinutes * 60);
    // If target changed, reset with new target when not running
    if (!t.isRunning && t.targetSeconds !== defaultMinutes * 60) {
      resetTimer(defaultMinutes * 60);
    }
    setState(loadTimer());
    // 500ms ticker for smooth progress
    const id = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(id);
  }, [open, defaultMinutes]);

  // Watch progress for callbacks
  React.useEffect(() => {
    if (!state) return;
    const { elapsed, pct } = getProgress();
    if (pct >= 80 && onReachedEighty) onReachedEighty();
    if (elapsed >= (state?.targetSeconds ?? defaultMinutes * 60)) {
      if (onFinished) onFinished();
    }
  }, [tick, state, onReachedEighty, onFinished, defaultMinutes]);

  if (!state) return null;

  const { elapsed, remaining, pct } = getProgress();
  const running = loadTimer()?.isRunning ?? false;

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
    resetTimer(state?.targetSeconds);
    setState(loadTimer());
  }

  function handleMinutesChange(v: number[]) {
    setMinutes(v[0]);
  }

  function handleApplyMinutes() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) return; // prevent target change mid-run
    const newState: TimerState = {
      ...t,
      targetSeconds: minutes * 60,
    };
    saveTimer(newState);
    setState(newState);
  }

  const mmRemaining = formatMMSS(remaining);
  const mmElapsed = formatMMSS(elapsed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Focus Timer</DialogTitle>
          <DialogDescription>Stay with one task until the timer ends. You can pause if needed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-semibold tabular-nums">{mmRemaining}</div>
              <div className="text-sm text-muted-foreground">Elapsed {mmElapsed}</div>
            </div>
            <Progress value={pct} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">{pct}%</div>
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Target duration</div>
              <div className="text-sm">{Math.round((loadTimer()?.targetSeconds ?? defaultMinutes * 60) / 60)} min</div>
            </div>
            <div className="pt-2">
              <Slider
                value={[minutes]}
                min={5}
                max={60}
                step={5}
                onValueChange={handleMinutesChange}
                disabled={running}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">Adjust in 5-min steps</div>
                <Button size="sm" variant="secondary" onClick={handleApplyMinutes} disabled={running}>
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleStartPause}>
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={handleReset} disabled={running || elapsed === 0}>
              Reset
            </Button>
          </div>

          {isComplete() ? (
            <div className="rounded-md bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-100 px-3 py-2 text-sm">
              Nice work! You hit your target. You can close the timer and mark today done.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
