// lib/achievements.ts
import { supabase } from "@/lib/supabase";
import type { ChallengeState } from "@/lib/types";

export type Unlock = { key: string; title: string; description?: string };

export function computeUnlocksFromState(s: ChallengeState): string[] {
  const keys: string[] = [];
  const completed = s.days.filter(d => d.completed).length;
  if (completed >= 1) keys.push("first_day");
  if (s.streak >= 3) keys.push("streak_3");
  if (s.streak >= 7) keys.push("streak_7");
  if ((s.xp ?? 0) >= 500) keys.push("xp_500");
  if ((s.xp ?? 0) >= 1000) keys.push("xp_1000");
  return keys;
}

export async function unlockOnServer(keys: string[]) {
  if (!keys.length) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // insert missing unlocks only
  await supabase.rpc("insert_missing_unlocks", { p_user_id: user.id, p_keys: keys });
}
