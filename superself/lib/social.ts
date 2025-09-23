// lib/social.ts
import { supabase} from "@/lib/supabase";
import { Activity, Friendship, Profile, PublicAchievement, PublicProfile } from "./types";



export async function meId() {
  
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function searchProfiles(q: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url, level, xp, streak, today_day")
    .ilike("username", `%${q}%`)
    .limit(10);
  return { data: (data ?? []) as Profile[], error };
}

export async function getFriendships() {
  
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at, updated_at")
    .order("updated_at", { ascending: false });
  return { data: (data ?? []) as Friendship[], error };
}

export async function sendFriendRequest(addresseeId: string) {
  
  const uid = await meId();
  if (!uid) return { error: new Error("Not signed in") };
  return supabase.from("friendships").insert([{ requester_id: uid, addressee_id: addresseeId, status: "pending" }]);
}

export async function acceptRequest(friendshipId: number) {
  
  return supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
}

export async function cancelRequest(friendshipId: number) {
  
  return supabase.from("friendships").delete().eq("id", friendshipId);
}

export async function blockUser(friendshipId: number) {
  
  return supabase.from("friendships").update({ status: "blocked" }).eq("id", friendshipId);
}

export async function fetchFriendActivities(limit = 50) {
  
  const { data, error } = await supabase
    .from("activity")
    .select("id, actor_id, type, day, xp, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as Activity[], error };
}

export async function fetchProfilesByIds(ids: string[]) {
  if (!ids.length) return { data: [] as Profile[] };
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url, level, xp, streak, today_day")
    .in("id", ids);
  return { data: (data ?? []) as Profile[], error };
}

export async function insertActivity(payload: Omit<Activity, "id" | "created_at">) {
  return supabase.from("activity").insert([payload]);
}
export async function fetchProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url, level, xp")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data as PublicProfile | null;
}

export async function fetchProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url, level, xp")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as PublicProfile | null;
}

export async function fetchLeaderboardSlices(userId: string) {
  const { data, error } = await supabase
    .from("leaderboards")
    .select("user_id, xp_alltime, xp_7d, xp_30d")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? { user_id: userId, xp_alltime: 0, xp_7d: 0, xp_30d: 0 };
}
export async function fetchPublicAchievements(userId: string): Promise<PublicAchievement[]> {
  const { data, error } = await supabase.rpc("public_achievements_for_user", { p_user_id: userId });
  if (error) throw error;
  return (data ?? []) as PublicAchievement[];
}

export async function fetchPublicActivity(userId: string, limit = 20) {
  const { data, error } = await supabase.rpc("public_activity_for_user", { p_user_id: userId, p_limit: limit });
  if (error) throw error;
  return data ?? [];
}