// lib/xp-server.ts
import { supabase } from "@/lib/supabase";

export async function awardXpServer(kind: "day_complete"|"weekly_retro"|"mood_checkin"|"tiny_habit", day: number | null, amount: number) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: authErr ?? new Error("Not signed in") };

  const { error } = await supabase.from("xp_events").insert([{ user_id: user.id, kind, day, amount }]);
  return { error };
}
