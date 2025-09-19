// lib/xp-server.ts
import { supabase } from "@/lib/supabase";

export async function awardXpServer(kind: "day_complete"|"weekly_retro"|"mood_checkin"|"tiny_habit", day: number | null, amount: number) {
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