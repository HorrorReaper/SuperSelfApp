"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, RotateCcw, X, Minimize2, Maximize2 } from "lucide-react";
import {
  getProgress,
  loadTimer,
  pauseTimer,
  startTimer,
  resetTimer,
} from "@/lib/timer";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Props = {
  onOpenTimer?: () => void;     // optional: open full modal
  initialVisible?: boolean;     // default true
  draggable?: boolean;          // default true
  showLabel?: boolean;          // default true in expanded mode
  autoExpandOnHover?: boolean;  // default true (desktop UX)
};

const POS_KEY = "miniTimer:pos";
const COMPACT_KEY = "miniTimer:compact";

function savePos(p: { x: number; y: number }) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {}
}
function loadPos(): { x: number; y: number } | null {
  try { const raw = localStorage.getItem(POS_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function loadCompactDefault(): boolean {
  try { const raw = localStorage.getItem(COMPACT_KEY); return raw ? JSON.parse(raw) : false; } catch { return false; }
}
function saveCompact(v: boolean) {
  try { localStorage.setItem(COMPACT_KEY, JSON.stringify(v)); } catch {}
}

export function MiniTimerWidget({
  onOpenTimer,
  initialVisible = true,
  draggable = true,
  autoExpandOnHover = true,
}: Props) {
  const [visible, setVisible] = React.useState(initialVisible);
  const [tick, setTick] = React.useState(0);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = React.useState(false);
  const [compact, setCompact] = React.useState(loadCompactDefault());

  // Update once per second
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Load saved position
  React.useEffect(() => {
    const p = loadPos();
    if (p) setPos(p);
  }, []);

  const timer = loadTimer();
  const running = timer?.isRunning ?? false;
  const { remaining, pct } = getProgress();
  const mmss = formatMMSS(remaining);
  const hasTimer = !!timer;

  // Draggable
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!draggable || !ref.current) return;
    const el = ref.current;
    let dragging = false;
    let startX = 0,
      startY = 0,
      offsetX = 0,
      offsetY = 0;

    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("button")) return; // don't drag on button clicks
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      offsetX = rect.left;
      offsetY = rect.top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const p = { x: offsetX + dx, y: offsetY + dy };
      setPos(p);
      savePos(p);
    }
    function onMouseUp() {
      dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    el.addEventListener("mousedown", onMouseDown);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggable]);

  if (!visible || !hasTimer) return null;

  // Geometry for circular progress
  const SIZE = compact ? 72 : 120;
  const R = compact ? 24 : 46;
  const CY = compact ? SIZE / 2 : 52;
  const CX = SIZE / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC - (Math.min(100, Math.max(0, pct)) / 100) * CIRC;

  // Position top-right by default; override when dragged
  const style: React.CSSProperties = pos ? { left: pos.x, top: pos.y } : { right: 16, top: 16 };

  function onPauseResume() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) pauseTimer();
    else startTimer(t.targetSeconds);
    setTick((n) => n + 1);
  }
  function onStop() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) pauseTimer();
    setTick((n) => n + 1);
  }
  function onReset() {
    resetTimer(timer?.targetSeconds);
    setTick((n) => n + 1);
  }

  function toggleCompact(next?: boolean) {
    const v = typeof next === "boolean" ? next : !compact;
    setCompact(v);
    saveCompact(v);
  }

  // Hover expand behavior (desktop)
  const expanded = compact ? (autoExpandOnHover && hover ? true : false) : true;

  return (
    <div
      ref={ref}
      style={style}
      className="fixed z-50 select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-live="polite"
    >
      {/* Container chooses compact or expanded style */}
      <div
        className={[
          expanded
            ? "w-[280px] max-w-[90vw] p-4 rounded-2xl"
            : "w-[120px] h-[120px] p-2 rounded-xl",
          "bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-2xl border border-black/5 dark:border-white/10 text-neutral-900 dark:text-neutral-100 transition-all",
        ].join(" ")}
      >
        {/* Header row (expanded only) */}
        {expanded ? (
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-80">Focus Timer</div>
            <div className="flex items-center gap-1">
              <button
                className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                onClick={() => toggleCompact(true)}
                title="Compact"
                aria-label="Compact mode"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                onClick={() => setVisible(false)}
                aria-label="Close mini timer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Compact small toolbar
          <div className="flex items-center justify-end">
            <button
              className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              onClick={() => toggleCompact(false)}
              title="Expand"
              aria-label="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Circular timer */}
        <div className={`flex items-center justify-center ${expanded ? "" : "mt-[-4px]"}`}>
          <svg width={SIZE} height={expanded ? 100 : SIZE}>
            {/* track */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth={expanded ? 8 : 6}
            />
            {/* gradient defs */}
            <defs>
              <linearGradient id="gradTimer" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* progress ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="url(#gradTimer)"
              strokeWidth={expanded ? 8 : 6}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
            {/* time text */}
            <text
              x={CX}
              y={CY + (expanded ? 4 : 2)}
              textAnchor="middle"
              className="font-semibold tabular-nums"
              style={{ fontSize: expanded ? 22 : 16 }}
            >
              {mmss}
            </text>
          </svg>
        </div>

        {/* Expanded-only: label and controls */}
        {expanded ? (
          <>

            <div className="mt-3 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={onPauseResume}
                title={running ? "Pause" : "Resume"}
                aria-label={running ? "Pause timer" : "Resume timer"}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={onStop}
                aria-label="Stop timer"
                title="Stop"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={onReset}
                aria-label="Reset timer"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {onOpenTimer ? (
              <div className="mt-2 text-center">
                <button className="text-xs text-primary hover:underline cursor-pointer" onClick={onOpenTimer}>
                  Open full timer
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
