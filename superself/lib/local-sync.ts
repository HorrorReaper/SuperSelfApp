// lib/local-sync.ts
import { supabase } from "@/lib/supabase";
import type { ChallengeState } from "@/lib/types";

let syncTimer: any = null;

export async function mirrorProfileFromState(s: ChallengeState) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  // debounce to avoid spamming
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    await supabase.from("profiles").upsert({
      id: userId,
      level: s.level ?? 1,
      xp: s.xp ?? 0,
      streak: s.streak ?? 0,
      today_day: s.todayDay ?? 1,
      updated_at: new Date().toISOString(),
    });
  }, 300);
}
