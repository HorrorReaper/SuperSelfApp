"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveIntake } from "@/lib/local";
import type { Intake, KeystoneHabit, PrimaryGoal } from "@/lib/types";

type ChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm transition ${
        selected
          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow"
          : "bg-white/70 text-gray-700 border-blue-200 hover:bg-blue-50"
      }`}
    >
      {label}
    </button>
  );
}

const PRIMARY_GOALS: { key: PrimaryGoal; title: string; desc: string }[] = [
  { key: "focus", title: "Focus & productivity", desc: "Daily deep-work momentum" },
  { key: "sleep", title: "Sleep consistency", desc: "Stabilize your sleep window" },
  { key: "movement", title: "Daily movement/steps", desc: "Build an active baseline" },
  { key: "nutrition", title: "Healthy eating basics", desc: "Simple, sustainable nutrition" },
  { key: "stress", title: "Stress reduction", desc: "Lower stress with micro-practices" },
  { key: "learning", title: "Learning habit", desc: "Show up for your curiosity" },
];

function getHabitOptions(goalKey: string): string[] {
  switch (goalKey) {
    case "focus":
      return ["25-minute focus block", "5-minute planning", "No-notifications hour"];
    case "movement":
      return ["6k steps", "2-minute mobility", "10 push-ups"];
    case "sleep":
      return ["Lights-down hour", "No screens 30m before bed", "Wake at same time"];
  case "nutrition":
      return ["Protein-first meal", "1 veggie add-on", "No sugary drink"];
    case "stress":
      return ["2-minute breathing", "Short walk break", "Gratitude note"];
    case "learning":
      return ["10 minutes of learning", "1 flashcard session", "Read 5 pages"];
    default:
      return ["2-minute mobility", "5-minute planning", "6k steps"];
  }
}

const TIME_WINDOWS = [
  { key: "morning", label: "Morning (6–10)" },
  { key: "midday", label: "Midday (10–2)" },
  { key: "afternoon", label: "Afternoon (2–6)" },
  { key: "evening", label: "Evening (6–10)" },
  { key: "none", label: "No preference" },
];

const CONSTRAINTS = [
  "Travel days",
  "Caregiving",
  "Shift work",
  "Device access limits",
];

const BARRIERS = [
  "Distractions",
  "Low energy",
  "Inconsistent sleep",
  "Overwhelm",
  "No time",
  "Perfectionism",
];

const SUPPORTS = [
  "Simple checklists",
  "Timers",
  "Templates",
  "Accountability pings",
  "Visual progress",
];

const ENERGY = ["Morning", "Afternoon", "Evening"];

const MOTIVATION = [
  { key: "solo", label: "Solo progress", desc: "See your private streaks" },
  { key: "buddy", label: "Buddy accountability", desc: "Pair up with a friend" },
  { key: "cohort", label: "Small cohort (5–10)", desc: "Tiny group momentum" },
  { key: "private", label: "Private only", desc: "Just you and your data" },
];

const REMINDER_CHANNEL = ["Email", "Push (later)", "None"];
const REMINDER_FREQ = ["Daily nudge", "Only if missed", "Weekly digest"];

export default function Step1Page() {
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | "">("");
  const habitOptions = useMemo(() => getHabitOptions(primaryGoal), [primaryGoal]);
  const [keystoneHabit, setKeystoneHabit] = useState<string>("");
  const [timeWindow, setTimeWindow] = useState<string>("none");
  const [baseline, setBaseline] = useState<number>(0);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [energy, setEnergy] = useState<string>("");
  const [motivation, setMotivation] = useState<string>("");
  const [reminderChannel, setReminderChannel] = useState<string>("Email");
  const [reminderFreq, setReminderFreq] = useState<string>("Daily nudge");
  const [barriers, setBarriers] = useState<string[]>([]);
  const [supports, setSupports] = useState<string[]>([]);
  const [graceDay, setGraceDay] = useState<boolean>(true);
  const [consentPersonalize, setConsentPersonalize] = useState<boolean>(false);
  const [consentShare, setConsentShare] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const baselineLabel = useMemo(() => {
    if (keystoneHabit.includes("steps")) return "Baseline steps per day";
    if (keystoneHabit.toLowerCase().includes("sleep") || primaryGoal === "sleep")
      return "Nights per week you keep a consistent sleep window";
    if (primaryGoal === "focus") return "Baseline minutes of focused work";
    if (primaryGoal === "learning") return "Baseline minutes of learning";
    if (primaryGoal === "movement") return "Baseline minutes of movement";
    if (primaryGoal === "nutrition") return "Baseline healthy meals per day";
    if (primaryGoal === "stress") return "Baseline minutes of stress relief";
    return "Baseline (units vary)";
  }, [keystoneHabit, primaryGoal]);

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string, max = Infinity) {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      if (list.length >= max) return;
      setList([...list, item]);
    }
  }

  function mapHabitToKey(habitLabel: string): KeystoneHabit | null {
    const l = habitLabel.toLowerCase();
    if (l.includes("step")) return "steps";
    if (l.includes("focus") || l.includes("25")) return "focus_block";
    if (l.includes("mobility")) return "mobility";
    if (l.includes("light") || l.includes("sleep")) return "lights_down";
    if (l.includes("learn")) return "learning_minutes";
    if (l.includes("plan")) return "planning";
    return null;
  }

  function handleSave() {
    setError("");
    if (!primaryGoal) {
      setError("Please select a primary goal.");
      return;
    }
    if (!keystoneHabit) {
      setError("Please choose one keystone habit.");
      return;
    }
    if (!consentPersonalize) {
      setError("Consent is required to personalize within the app.");
      return;
    }

    const habitKey = mapHabitToKey(keystoneHabit);
    if (!habitKey) {
      setError("Please choose a supported keystone habit (or rename it to match a known type).");
      return;
    }

    const reminders: Intake["reminders"] = {
      channel: reminderChannel.toLowerCase().startsWith("email")
        ? "email"
        : reminderChannel.toLowerCase().startsWith("push")
        ? "push"
        : "none",
      frequency: reminderFreq.toLowerCase().includes("missed")
        ? "missed"
        : reminderFreq.toLowerCase().includes("weekly")
        ? "weekly"
        : "daily",
    };

    const baselineObj: Intake["baseline"] = (() => {
      if (habitKey === "steps") return { steps: baseline };
      if (habitKey === "lights_down") return { sleepWindow: baseline };
      return { minutes: baseline };
    })();

    const intake: Intake = {
      goal: primaryGoal as PrimaryGoal,
      keystoneHabit: habitKey,
      timeWindow: timeWindow as Intake["timeWindow"],
      reminders,
      baseline: baselineObj,
      constraints,
      energyPeak: energy ? (energy.toLowerCase() as Intake["energyPeak"]) : undefined,
      motivation: (motivation || "solo") as Intake["motivation"],
      barriers,
      supports,
      graceDay,
      note: undefined,
    };

    try {
      saveIntake(intake);
      console.log("Saved Intake for challenge:", intake);
      window.location.href = "/journeys/self-improvement-journey";
    } catch (e) {
      setError("Couldn't save locally. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-green-200 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-green-700 mb-2">Step 1: Personalize Your 30-Day Plan</h1>
        <p className="text-gray-700 mb-6">Answer a few quick questions to tailor your journey.</p>

        {/* Primary goal */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Primary goal for the next 30 days</h2>
          <p className="text-sm text-gray-600 mb-3">Guides lesson emphasis and daily prompts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIMARY_GOALS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setPrimaryGoal(g.key)}
                className={`text-left p-4 rounded-2xl border transition ${
                  primaryGoal === g.key
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow"
                    : "bg-white/70 border-blue-200 hover:bg-blue-50"
                }`}
              >
                <div className="font-semibold">{g.title}</div>
                <div className="text-sm opacity-90">{g.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Keystone habit */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">One keystone habit to practice daily</h2>
          <p className="text-sm text-gray-600 mb-3">Keeps the challenge anchored to a single, verifiable action.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {habitOptions.map((h) => (
              <Chip key={h} label={h} selected={keystoneHabit === h} onClick={() => setKeystoneHabit(h)} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="border border-blue-200 rounded px-3 py-2 w-full"
              placeholder="Or enter a custom habit"
              value={keystoneHabit && !habitOptions.includes(keystoneHabit) ? keystoneHabit : ""}
              onChange={(e) => setKeystoneHabit(e.target.value)}
            />
          </div>
        </section>

        {/* Preferred time window */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Preferred time window</h2>
          <p className="text-sm text-gray-600 mb-3">Enables timely reminders and reduces friction.</p>
          <div className="flex flex-wrap gap-2">
            {TIME_WINDOWS.map((t) => (
              <Chip key={t.key} label={t.label} selected={timeWindow === t.key} onClick={() => setTimeWindow(t.key)} />
            ))}
          </div>
        </section>

        {/* Baseline and constraints */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Current baseline and constraints</h2>
          <p className="text-sm text-gray-600 mb-3">Sets realistic targets and calibrates difficulty.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{baselineLabel}</label>
              <input
                type="number"
                className="border border-blue-200 rounded px-3 py-2 w-full"
                value={baseline}
                min={0}
                onChange={(e) => setBaseline(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
              <div className="flex flex-wrap gap-2">
                {CONSTRAINTS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={constraints.includes(c)}
                    onClick={() => toggleItem(constraints, setConstraints, c)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Energy pattern */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Energy and schedule pattern</h2>
          <p className="text-sm text-gray-600 mb-3">Helps schedule timeboxed blocks smartly.</p>
          <div className="flex flex-wrap gap-2">
            {ENERGY.map((e) => (
              <Chip key={e} label={e} selected={energy === e} onClick={() => setEnergy(e)} />
            ))}
          </div>
        </section>

        {/* Motivation style */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Motivation style</h2>
          <p className="text-sm text-gray-600 mb-3">Tunes social features and nudges.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOTIVATION.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMotivation(m.key)}
                className={`text-left p-4 rounded-2xl border transition ${
                  motivation === m.key
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow"
                    : "bg-white/70 border-blue-200 hover:bg-blue-50"
                }`}
              >
                <div className="font-semibold">{m.label}</div>
                <div className="text-sm opacity-90">{m.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Reminders */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Reminder preferences</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_CHANNEL.map((c) => (
                  <Chip key={c} label={c} selected={reminderChannel === c} onClick={() => setReminderChannel(c)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_FREQ.map((f) => (
                  <Chip key={f} label={f} selected={reminderFreq === f} onClick={() => setReminderFreq(f)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Barriers and supports */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Barriers and supports</h2>
          <p className="text-sm text-gray-600 mb-3">Pick up to 2 each to shape micro-actions and tips.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biggest blockers (max 2)</label>
              <div className="flex flex-wrap gap-2">
                {BARRIERS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    selected={barriers.includes(b)}
                    onClick={() => toggleItem(barriers, setBarriers, b, 2)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support you can use (max 2)</label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    selected={supports.includes(s)}
                    onClick={() => toggleItem(supports, setSupports, s, 2)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Streak policy */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Streak policy</h2>
          <p className="text-sm text-gray-600 mb-3">Allow 1 grace day/week to keep streak?</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={graceDay} onChange={(e) => setGraceDay(e.target.checked)} />
              <span>Yes, allow a grace day</span>
            </label>
          </div>
        </section>

        {/* Consent */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Consent and privacy</h2>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={consentPersonalize}
                onChange={(e) => setConsentPersonalize(e.target.checked)}
              />
              <span>Use my data to personalize within the app (required)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={consentShare}
                onChange={(e) => setConsentShare(e.target.checked)}
              />
              <span>Share my daily completion with my cohort (optional)</span>
            </label>
          </div>
        </section>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        <div className="flex justify-end">
          <Button
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full shadow hover:opacity-95"
            onClick={handleSave}
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
