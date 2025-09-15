// lib/social.ts
import { supabase} from "@/lib/supabase";

export type Profile = {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak: number;
  today_day: number;
};

export type Friendship = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: number;
  actor_id: string;
  type: "day_complete" | "level_up" | "tiny_habit" | "weekly_retro" | "mood_checkin" | "cheer";
  day: number | null;
  xp: number | null;
  message: string | null;
  created_at: string;
};

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
