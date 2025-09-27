// lib/nextday/complete.ts
import { supabase } from "@/lib/supabase";

export async function completeDay(planId: string, planDateISO: string) {
  const { data: updated } = await supabase
    .from("day_plans")
    .update({ status: "completed" })
    .eq("id", planId)
    .select("*").single();

  // Award XP (idempotent via dedupe_key)
  await supabase
    .from("xp_events")
    .upsert({
      user_id: updated.user_id,
      kind: "day_complete",
      day: planDateISO,
      amount: 10,
      dedupe_key: `day_complete:${planDateISO}`,
    }, { onConflict: "user_id,kind,day,dedupe_key" });

  return updated;
}
