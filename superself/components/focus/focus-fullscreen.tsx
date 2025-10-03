// components/focus/focus-fullscreen.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

async function playSound(src: string) {
  try { await new Audio(src).play(); } catch {}
}

// Detectors/helpers
function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}
function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // youtube.com/embed/VIDEOID
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\/+/, "");
      if (id) return id;
    }
  } catch {}
  return null;
}
function toYouTubeEmbed(url: string): string | null {
  const id = parseYouTubeId(url);
  if (!id) return null;
  // Loop requires playlist=id as well
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0&playsinline=1`;
}
function parseVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts.find(p => /^\d+$/.test(p));
      return id ?? null;
    }
  } catch {}
  return null;
}
function toVimeoEmbed(url: string): string | null {
  const id = parseVimeoId(url);
  if (!id) return null;
  // background param hides controls and fills
  return `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1&autopause=0&playsinline=1`;
}

// Background renderer
function BackgroundMedia({ url }: { url: string | null }) {
  if (!url) return null;

  const yt = toYouTubeEmbed(url);
  const vm = toVimeoEmbed(url);

  if (yt) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <iframe
          src={yt}
          title="YouTube background"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
          // Slight scale to better cover edges
          style={{ transform: "scale(1.12)", pointerEvents: "none" }}
        />
      </div>
    );
  }

  if (vm) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <iframe
          src={vm}
          title="Vimeo background"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ transform: "scale(1.12)", pointerEvents: "none" }}
        />
      </div>
    );
  }

  if (isDirectVideo(url)) {
    return (
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={url}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  // Image fallback
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

const BG_KEY = "focus_bg_url"; // localStorage key

export function FocusFullscreen() {
  const params = useSearchParams();
  // Read params: prefer `duration`, fall back to `m` for legacy
  const paramDuration = (() => {
    const d = params.get("duration") ?? params.get("m");
    const n = Number(d);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  })();
  const defaultM = Math.max(5, Math.min(60, paramDuration ?? 25));
  const sessionTitleParam = params.get("title") ?? "";
  const sessionTaskId = params.get("task_id") ?? "";
  const [sessionTaskText, setSessionTaskText] = React.useState<string | null>(null);

  // If a task_id is present, fetch the task text to show a friendlier label
  React.useEffect(() => {
    if (!sessionTaskId) return;
    let mounted = true;
    (async () => {
      try {
        const idNum = Number(sessionTaskId);
        if (!Number.isFinite(idNum)) return;
        const { data, error } = await supabase.from("tasks").select("text").eq("id", idNum).maybeSingle();
        if (error) {
          // non-fatal
          toast.error("Could not load task");
          return;
        }
        if (!mounted) return;
        type RawTask = { text?: string } | null;
        const task = data as RawTask;
        setSessionTaskText(task?.text ?? null);
      } catch (_err: unknown) {
        // ignore non-fatal fetch errors
      }
    })();
    return () => { mounted = false; };
  }, [sessionTaskId]);

  const [state, setState] = React.useState<TimerState | null>(null);
  const [tick, setTick] = React.useState(0);
  const [todoText, setTodoText] = React.useState("");
  const [bgUrl, setBgUrl] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(BG_KEY) ?? "";
  });

  // Initialize or load timer
  React.useEffect(() => {
    // If URL provides a duration, initialize/reset to that duration so the session matches the link
    const targetSeconds = defaultM * 60;
    let t = loadTimer() ?? initTimer(targetSeconds);
    if (t && t.targetSeconds !== targetSeconds) {
      // Reset to the requested duration while preserving other timer fields
      resetTimer(targetSeconds);
      t = loadTimer() ?? initTimer(targetSeconds);
    }
    // Older saved timer objects might lack a proper todos array; ensure it's present
    if (t && !Array.isArray(t.todos)) {
      t.todos = [];
      saveTimer(t);
    }
    setState(t);

    const id = setInterval(() => setTick((x) => x + 1), 500);
    const onStorage = () => setState(loadTimer());
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(id); window.removeEventListener("storage", onStorage); };
  }, [defaultM]);

  // 80% and 100% beeps
  const notifiedRef = React.useRef({ eighty: false, hundred: false });
  React.useEffect(() => {
    if (!state) return;
    const { elapsed, pct } = getProgress();
    if (pct >= 80 && !notifiedRef.current.eighty) {
      notifiedRef.current.eighty = true;
      playSound("/sounds/chime80.mp3");
      navigator.vibrate?.(100);
    }
    if (elapsed >= (state?.targetSeconds ?? defaultM * 60) && !notifiedRef.current.hundred) {
      notifiedRef.current.hundred = true;
      playSound("/sounds/chime100.mp3");
      navigator.vibrate?.(200);
      toast.success("Session complete");
    }
  }, [tick, state, defaultM]);

  if (!state) return null;

  const { elapsed, remaining, pct } = getProgress();
  const running = loadTimer()?.isRunning ?? false;
  const quote = state.quote ?? { text: "Make it easy to start today.", author: "", bg: "" };
  const mmRemaining = formatMMSS(remaining);
  const mmElapsed = formatMMSS(elapsed);
  const background = (bgUrl || quote.bg || "").trim();

  function handleStartPause() {
    const t = loadTimer();
    if (!t) return;
    if (t.isRunning) pauseTimer();
    else startTimer(t.targetSeconds || defaultM * 60);
    setState(loadTimer());
  }
  function handleReset() {
    notifiedRef.current = { eighty: false, hundred: false };
    resetTimer(state?.targetSeconds);
    setState(loadTimer());
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
  function applyBackground() {
    localStorage.setItem(BG_KEY, bgUrl.trim());
    toast("Background updated");
  }

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Background media */}
      {background ? <BackgroundMedia url={background} /> : null}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 -z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-sm opacity-90">Focus Session</div>
          {sessionTitleParam || sessionTaskId ? (
            <div className="text-xs opacity-80">
              {sessionTitleParam}
              {sessionTaskId ? (
                sessionTaskText ? ` • ${sessionTaskText}` : ` • Task #${sessionTaskId}`
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-[320px] bg-white/10 placeholder:text-white/70"
            placeholder="Paste image, MP4/WebM, YouTube or Vimeo URL…"
            value={bgUrl}
            onChange={(e) => setBgUrl(e.target.value)}
          />
          <Button size="sm" variant="secondary" onClick={applyBackground}>Set background</Button>
          <Button size="sm" variant="ghost" onClick={() => window.close()}>Close tab</Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 px-4 pb-8">
        {/* Center panel */}
        <div className="lg:col-span-3 flex flex-col items-center pt-10">
          {/* Quote */}
          <div className="max-w-2xl text-center">
            <div className="text-lg sm:text-xl font-medium leading-snug drop-shadow">{quote.text}</div>
            {quote.author ? <div className="mt-1 text-sm opacity-80">— {quote.author}</div> : null}
          </div>

          {/* Time and progress */}
          <div className="mt-10 flex flex-col items-center">
            <div className="text-7xl sm:text-8xl font-semibold tabular-nums drop-shadow">{mmRemaining}</div>
            <div className="mt-2 text-sm opacity-90">Elapsed {mmElapsed}</div>
            <div className="mt-4 w-full max-w-lg">
              <Progress value={pct} />
              <div className="mt-1 text-xs opacity-90 text-center">{pct}%</div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-3">
            <Button onClick={handleStartPause}>{running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}</Button>
            <Button variant="secondary" onClick={handleReset} disabled={running || elapsed === 0}>Reset</Button>
          </div>

          {isComplete() ? (
            <div className="mt-4 rounded-md bg-emerald-500/20 text-emerald-50 px-3 py-2 text-sm">
              Great job! Session complete.
            </div>
          ) : null}
        </div>

        {/* Tasks panel */}
        <div className="lg:col-span-2">
          <div className="mt-6 lg:mt-16 rounded-lg bg-white/10 backdrop-blur border border-white/20 p-4">
            <div className="text-sm font-medium">Todo for this session</div>
            <div className="mt-3 flex gap-2">
              <Input
                className="bg-white/10 placeholder:text-white/70"
                placeholder="Add a task…"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodoLocal()}
              />
              <Button variant="secondary" onClick={addTodoLocal}>Add</Button>
            </div>
            <ul className="mt-3 space-y-2">
              {Array.isArray(state.todos) && state.todos.length === 0 ? (
                <li className="text-xs opacity-80">Tip: Add 1–3 small tasks to stay focused.</li>
              ) : (
                (Array.isArray(state.todos) ? state.todos : []).map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => { toggleTodoLocal(t.id); playSound("/sounds/check.mp3"); }}
                    />
                    <span className={`flex-1 text-sm ${t.done ? "line-through opacity-80" : ""}`}>{t.text}</span>
                    <Button size="icon" variant="ghost" onClick={() => deleteTodoLocal(t.id)} aria-label="Delete">✕</Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
