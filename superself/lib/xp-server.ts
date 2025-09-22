// lib/xp-server.ts
import { supabase } from "@/lib/supabase";

export async function awardXpServer(kind: "day_complete"|"weekly_retro"|"mood_checkin"|"tiny_habit"| "focus_session" | "flashcards_practice" | "task_complete", day: number | null, amount: number) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: authErr ?? new Error("Not signed in") };

  const { error } = await supabase.from("xp_events").upsert([{ user_id: user.id, kind, day, amount }], { onConflict: "user_id,kind,day", ignoreDuplicates: true });
  return { error };
}
export async function awardFocusSessionXP(amount: number, day: number | null) {
  // @ts-expect-error widen kind server-side via SQL change
  return awardXpServer("focus_session", day, amount);
}
export async function awardTaskCompleteXP(amount: number, day: number | null) {
  // @ts-expect-error widen kind server-side via SQL change
  return awardXpServer("task_complete", day, amount);
}
export async function awardFlashcardsXP(amount: number, day: number | null) {
  // @ts-expect-error widen kind allowed server-side
  return awardXpServer("flashcards_practice", day, amount);
}
export async function loadXPFromServer() {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: authErr ?? new Error("Not signed in"), xp: 0, level: 1, nextLevelXP: 100, xpPct: 0 };
  const { data, error } = await supabase.from("users").select("xp").eq("id", user.id).single();
  if (error || !data) return { error, xp: 0, level: 1, nextLevelXP: 100, xpPct: 0 };
  const xp = data.xp ?? 0;
  const level = Math.floor(0.1 * Math.sqrt(xp));
  const nextLevelXP = Math.floor(((level + 1) / 0.1) ** 2);
  const xpPct = (xp - (level / 0.1) ** 2) / (nextLevelXP - (level / 0.1) ** 2);
  return { error: null, xp, level, nextLevelXP, xpPct };
}