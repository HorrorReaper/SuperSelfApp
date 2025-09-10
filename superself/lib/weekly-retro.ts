// lib/weekly-retro.ts
import { format } from "date-fns";
import type { ChallengeState, DayProgress } from "./types";

export type WeekMetrics = {
  weekIndex: number;        // 1..4 (for 30 days)
  startDay: number;         // 1, 8, 15, 22
  endDay: number;           // 7, 14, 21, 30
  completionDays: number;   // how many days marked completed
  totalSessions: number;    // sum of sessions array lengths
  totalMinutes: number;     // sum of minutes (sessions or habitMinutes)
  avgSessionMinutes: number;
  tinyHabitDays: number;    // tiny habit completion count
};

function sumSessionMinutes(d: DayProgress): number {
  if (d.sessions && d.sessions.length > 0) {
    return d.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
  }
  // fallback to habitMinutes if sessions are not implemented
  return d.habitMinutes ?? 0;
}

function countSessions(d: DayProgress): number {
  return d.sessions ? d.sessions.length : (d.habitMinutes ? 1 : 0);
}

export function computeWeekData(state: ChallengeState, weekIndex: number): WeekMetrics {
  const startDay = (weekIndex - 1) * 7 + 1;
  const endDay = Math.min(weekIndex * 7, 30);

  const days = state.days
    .filter((d) => d.day >= startDay && d.day <= endDay)
    .sort((a, b) => a.day - b.day);

  const completionDays = days.filter((d) => d.completed).length;
  const totalSessions = days.reduce((acc, d) => acc + countSessions(d), 0);
  const totalMinutes = days.reduce((acc, d) => acc + sumSessionMinutes(d), 0);
  const avgSessionMinutes =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  const tinyHabitDays =
    (state.tinyHabitCompletions ?? []).filter((t) => t.day >= startDay && t.day <= endDay && t.done).length;

  return {
    weekIndex,
    startDay,
    endDay,
    completionDays,
    totalSessions,
    totalMinutes,
    avgSessionMinutes,
    tinyHabitDays,
  };
}

export function generateSummary(metrics: WeekMetrics, targetMinutesPerDay: number) {
  const {
    weekIndex,
    completionDays,
    totalSessions,
    totalMinutes,
    avgSessionMinutes,
    tinyHabitDays,
  } = metrics;

  const avgPerDay = Math.round(totalMinutes / 7);

  // Simple, readable summary
  const lines: string[] = [];
  lines.push(`Week ${weekIndex} recap`);
  lines.push(
    `You completed ${completionDays}/7 days, with ${totalSessions} sessions totaling ${totalMinutes} minutes (${avgPerDay}/day).`
  );

  if (avgSessionMinutes > 0) {
    lines.push(`Average session length: ${avgSessionMinutes} minutes.`);
  }

  if (tinyHabitDays > 0) {
    lines.push(`Tiny habit completed on ${tinyHabitDays}/7 days. Nice layering!`);
  }

  // Suggestion logic (lightweight rules)
  let suggestion = "";
  const targetWeek = targetMinutesPerDay * 5; // aim for 5 days/week as a gentle baseline
  if (completionDays >= 5 && avgPerDay >= targetMinutesPerDay - 5) {
    suggestion = "Keep the rhythm. Try a small upgrade: +5 minutes on one session, or add a second mini-session on your best day.";
  } else if (completionDays >= 3) {
    suggestion = "You’ve got a base. Pick a consistent time window and protect it—set a daily reminder and prep your space 1 minute before.";
  } else {
    suggestion =
      "Make it easier to start: cut your session in half, and plan a ‘2‑minute win’ backup. Focus on showing up, not perfect totals.";
  }

  const summaryText = lines.join(" ");

  return { summaryText, suggestion };
}
