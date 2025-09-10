import type { MicroBrief } from "./types";

export const WEEK1_BRIEFS: MicroBrief[] = [
  {
    day: 1,
    title: "Start before you feel ready",
    tldr: "A short imperfect start beats a perfect plan.",
    content:
      "Momentum comes from action. Today, pick one tiny task and start a 10–25 minute focus block. Silence notifications, choose one task, and press start. Done is data you can improve tomorrow.",
    actionLabel: "Start focus block",
  },
  {
    day: 2,
    title: "Implementation intentions",
    tldr: "After [cue], I will [action] for 2 minutes.",
    content:
      "Design the moment before the habit. Choose a specific cue—after coffee, after lunch—and commit to a 2-minute first rep. Clarity reduces friction.",
    actionLabel: "Do 2-minute first rep",
  },
  {
    day: 3,
    title: "Environment beats willpower",
    tldr: "Make the good easier and the distracting harder.",
    content:
      "Remove one friction and add one prompt. Lay out what you need, and put distractions out of sight. Small tweaks, big payoff.",
    actionLabel: "Do a 5-minute setup",
  },
  {
    day: 4,
    title: "Timeboxing tomorrow (mini)",
    tldr: "Decide the when, not just the what.",
    content:
      "Pick tomorrow’s top task and give it a 15–25 minute slot. Your calendar becomes a promise to your future self.",
    actionLabel: "Timebox 15–25 minutes",
  },
  {
    day: 5,
    title: "Single-tasking cue",
    tldr: "One tab, one task, one timer.",
    content:
      "Multitasking splits attention. Today, try a single-task drill: one tab/app only during your next focus block. Notice the difference.",
    actionLabel: "Run single-task drill",
  },
  {
    day: 6,
    title: "Shutdown mini",
    tldr: "Close loops; write tomorrow’s top 3.",
    content:
      "End your day with a 5-minute shutdown: capture loose ends, pick the top 1–3 for tomorrow, and tidy your space.",
    actionLabel: "Do a 5-minute shutdown",
  },
  {
    day: 7,
    title: "Weekly retro",
    tldr: "Review what worked; choose one tweak.",
    content:
      "Look at your completions this week. What helped? What got in the way? Choose one tiny tweak for next week. You’re building a system.",
    actionLabel: "Do 2-minute retro",
  },
];

export function getBriefForDay(day: number): MicroBrief | null {
  return WEEK1_BRIEFS.find((b) => b.day === day) ?? null;
}
