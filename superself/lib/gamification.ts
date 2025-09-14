// lib/gamification.ts
import { loadState, saveState } from "@/lib/local";
import { adherence, computeStreak } from "@/lib/compute";
import type { ChallengeState } from "@/lib/types";
import { ensureDay } from "@/lib/compute";

// Level curve: total XP needed to reach level L is 50 * L * (L + 1) / 2
// This yields L1=50, L2 total=150, L3 total=300, ... Good for a 30-day arc.
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0; // level 1 starts at 0
  return Math.floor(50 * level * (level + 1) / 2);
}

// Given total XP, return current level
export function levelForXp(xp: number): number {
  let lvl = 1;
  while (xp >= totalXpForLevel(lvl + 1)) lvl++;
  return lvl;
}

// Progress within current level
export function xpProgress(xp: number) {
  const level = levelForXp(xp);
  const curBase = totalXpForLevel(level);
  const nextBase = totalXpForLevel(level + 1);
  const inLevel = xp - curBase;
  const needed = nextBase - curBase;
  const pct = needed > 0 ? Math.min(1, inLevel / needed) : 1;
  return { level, inLevel, needed, pct, nextLevelAt: nextBase };
}

function pushLog(s: ChallengeState, amount: number, reason: string, day?: number) {
  s.xpLog = s.xpLog ?? [];
  s.xpLog.push({
    id: uid(),
    day,
    amount,
    reason,
    createdAtISO: new Date().toISOString(),
  });
  if (s.xpLog.length > 200) s.xpLog.shift();
}

// Cross-runtime small uid helper: use crypto.randomUUID when available, otherwise fall back
function uid() {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  // fallback - simple RFC4122 v4-ish generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mutates and saves state; returns details for UI
function awardXpInternal(s: ChallengeState, amount: number, reason: string, day?: number) {
  const beforeXp = s.xp ?? 0;
  const beforeLevel = s.level ?? 1;

  s.xp = beforeXp + amount;
  const afterLevel = levelForXp(s.xp);
  const levelUp = afterLevel > beforeLevel;
  s.level = afterLevel;
  if (levelUp) s.lastLevelUpISO = new Date().toISOString();

  pushLog(s, amount, reason, day);
  saveState(s);

  return { gained: amount, levelUp, newLevel: afterLevel };
}

// —— Public awarders (each dedupes) ——

export function awardForDayCompletion(day: number) {
  const s = loadState<ChallengeState>();
  if (!s) return { gained: 0, levelUp: false, newLevel: 1 };

  // prevent double-award
  if (s.xpLog?.some(e => e.reason === "day_complete" && e.day === day)) {
    return { gained: 0, levelUp: false, newLevel: s.level ?? 1 };
  }

  // base + streak bonus (10 XP per full 7-day streak chunk, max +30)
  const base = 50;
  const streak = computeStreak(s.days);
  const bonus = Math.min(30, Math.floor(streak / 7) * 10);
  const total = base + bonus;

  return awardXpInternal(s, total, "day_complete", day);
}

export function awardForWeeklyRetro(weekIndex: number) {
  const s = loadState<ChallengeState>();
  if (!s) return { gained: 0, levelUp: false, newLevel: 1 };
  // one per week
  if (s.xpLog?.some(e => e.reason === "weekly_retro" && e.day === weekIndex)) {
    return { gained: 0, levelUp: false, newLevel: s.level ?? 1 };
  }
  return awardXpInternal(s, 20, "weekly_retro", weekIndex);
}

export function awardForMoodCheckin(day: number) {
  const s = loadState<ChallengeState>();
  if (!s) return { gained: 0, levelUp: false, newLevel: 1 };
  // once per day
  if (s.xpLog?.some(e => e.reason === "mood_checkin" && e.day === day)) {
    return { gained: 0, levelUp: false, newLevel: s.level ?? 1 };
  }
  return awardXpInternal(s, 5, "mood_checkin", day);
}

export function awardForTinyHabit(day: number) {
  const s = loadState<ChallengeState>();
  if (!s) return { gained: 0, levelUp: false, newLevel: 1 };
  // once per day
  if (s.xpLog?.some(e => e.reason === "tiny_habit" && e.day === day)) {
    return { gained: 0, levelUp: false, newLevel: s.level ?? 1 };
  }
  return awardXpInternal(s, 10, "tiny_habit", day);
}
function resetGraceIfNeeded(s: ChallengeState, todayDay: number) {
  const weekIndex = Math.ceil(todayDay / 7);
  if (s._graceWeekIndex !== weekIndex) {
    s._graceWeekIndex = weekIndex;
    s.graceUsedThisWeek = 0;
  }
}
export function completeDayWithPolicy(day: number) {
  const s = loadState<ChallengeState>();
  if (!s) return { ok: false };

  resetGraceIfNeeded(s, s.todayDay);

  const today = s.todayDay;
  const daysLate = Math.max(0, today - day);

  // Decide policy
  let xpMult = 1;
  let countsForStreak = true;
  let usedGrace = false;
  let reasonSuffix = "on_time";

  if (daysLate === 0) {
    // on time
  } else if (daysLate === 1) {
    if ((s.graceUsedThisWeek ?? 0) < 1) {
      usedGrace = true;
      s.graceUsedThisWeek = (s.graceUsedThisWeek ?? 0) + 1;
      reasonSuffix = "grace";
    } else {
      xpMult = 0.7;
      countsForStreak = false;
      reasonSuffix = "late_1";
    }
  } else if (daysLate <= 7) {
    xpMult = 0.5;
    countsForStreak = false;
    reasonSuffix = "late_7";
  } else {
    xpMult = 0.3;
    countsForStreak = false;
    reasonSuffix = "late_8plus";
  }

  // Mark completion on the right day
  const rec = ensureDay(s.days, day);
  if (!rec.completed) {
    rec.completed = true;
    rec.completedAtISO = new Date().toISOString();
    rec.creditedToStreak = countsForStreak;
    rec.usedGrace = usedGrace;
  }

  // Compute base XP and conditional streak bonus (only if countsForStreak)
  const base = 50;
  const streak = computeStreak(s.days, today);
  const streakBonus = countsForStreak ? Math.min(30, Math.floor(streak / 7) * 10) : 0;
  const total = Math.round((base + streakBonus) * xpMult);

  const award = awardXpInternal(s, total, `day_complete_${reasonSuffix}`, day);
  return {
    ok: true,
    policy: { xpMult, countsForStreak, usedGrace, reason: reasonSuffix, daysLate },
    award,
  };
}
function currentWeekIndex(day: number) {
  return Math.ceil(day / 7);
}

export function previewMakeupPolicy(day: number) {
  const s = loadState<ChallengeState>();
  if (!s) return null;

  const today = s.todayDay ?? 1;
  const daysLate = Math.max(0, today - day);

  // Determine grace availability for the current week in a non-mutating way
  const weekIndex = currentWeekIndex(today);
  const storedWeek = s._graceWeekIndex ?? weekIndex;
  const graceUsedStored = s.graceUsedThisWeek ?? 0;
  const graceUsedThisWeek = storedWeek === weekIndex ? graceUsedStored : 0;

  let xpMult = 1;
  let countsForStreak = true;
  let reason: "on_time" | "grace" | "late_1" | "late_7" | "late_8plus" = "on_time";

  if (daysLate === 0) {
    // on time
  } else if (daysLate === 1) {
    if (graceUsedThisWeek < 1) {
      reason = "grace";
      // 100% XP, streak counts
    } else {
      xpMult = 0.7;
      countsForStreak = false;
      reason = "late_1";
    }
  } else if (daysLate <= 7) {
    xpMult = 0.5;
    countsForStreak = false;
    reason = "late_7";
  } else {
    xpMult = 0.3;
    countsForStreak = false;
    reason = "late_8plus";
  }

  return { daysLate, xpMult, countsForStreak, reason };
}
