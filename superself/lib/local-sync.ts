// lib/local-sync.ts
import { supabase } from "@/lib/supabase";
import type { ChallengeState } from "@/lib/types";
import { upsertTinyHabitForUser } from "@/lib/tiny-habits";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export async function mirrorProfileFromState(s: ChallengeState) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  // debounce to avoid spamming
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    // Upsert profile summary
    await supabase.from("profiles").upsert({
      id: userId,
      level: s.level ?? 1,
      xp: s.xp ?? 0,
      streak: s.streak ?? 0,
      today_day: s.todayDay ?? 1,
      updated_at: new Date().toISOString(),
    });

    // Mirror per-day rows into challenge_days for server-side streak computation
    try {
      const rows = (s.days ?? []).map((d) => ({
        user_id: userId,
        day_number: d.day,
        date_iso: d.dateISO,
        completed: !!d.completed,
        credited_to_streak: d.creditedToStreak !== false,
        habit_minutes: d.habitMinutes ?? 0,
        sessions: JSON.stringify(d.sessions ?? []),
        completed_at: d.completedAtISO ?? null,
      }));
      if (rows.length > 0) {
        // upsert in batches if needed (supabase client accepts array)
        await supabase.from("challenge_days").upsert(rows, { onConflict: "user_id,day_number" });
      }
    } catch (err: unknown) {
      // best-effort: ignore mirror errors
      if (err instanceof Error) console.error("mirrorProfileFromState: failed to upsert challenge_days", err.message);
      else console.error("mirrorProfileFromState: failed to upsert challenge_days", err);
    }
    // Best-effort: persist tiny-habit config and completions to tiny_habits table via helper
    try {
      if (s.tinyHabit || (s.tinyHabitCompletions && s.tinyHabitCompletions.length > 0)) {
        await upsertTinyHabitForUser(userId, "30 Day Self Improvement Challenge", s.tinyHabit ?? null, s.tinyHabitCompletions ?? null);
      }
    } catch (err: unknown) {
      console.debug("mirrorProfileFromState: tiny-habit upsert failed (best-effort)", err);
    }
  }, 300);
}
