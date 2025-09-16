// lib/achievements-client.ts
import { supabase } from "@/lib/supabase";

export type Achievement = {
  key: string;
  title: string;
  description: string | null;
  tier: string | null;
  icon: string | null;
  target: number | null;
  sort: number | null;
};

export async function fetchAchievementCatalog() {
  const { data, error } = await supabase
    .from("achievements_catalog")
    .select("key, title, description, tier, icon, target, sort")
    .order("sort", { ascending: true });
  return { data: (data ?? []) as Achievement[], error };
}

export async function fetchMyUnlocks() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { data: [] as { key: string; unlocked_at: string }[] };
  const { data, error } = await supabase
    .from("achievement_unlocks")
    .select("key, unlocked_at")
    .order("unlocked_at", { ascending: false });
  return { data: (data ?? []) as { key: string; unlocked_at: string }[], error };
}
