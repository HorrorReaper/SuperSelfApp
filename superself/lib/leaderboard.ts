// lib/leaderboard.ts
import { supabase } from "@/lib/supabase";
import { getFriendships, meId } from "@/lib/social";

type Period = "alltime" | "7d" | "30d";
type LeaderRow = {
  user_id: string;
  xp_alltime: number;
  xp_7d: number;
  xp_30d: number;
  profile: { id: string; username: string | null; name: string | null; avatar_url: string | null; level: number | null; xp: number | null };
};

function orderKey(period: Period) {
  return period === "alltime" ? "xp_alltime" : period === "7d" ? "xp_7d" : "xp_30d";
}

// Helper to extract the "other user" id from an edge, regardless of column naming
function otherPartyId(edge: any, my: string) {
  if (edge?.a_id && edge?.b_id) {
    if (edge.a_id === my) return edge.b_id;
    if (edge.b_id === my) return edge.a_id;
  }
  if (edge?.requester_id && edge?.addressee_id) {
    if (edge.requester_id === my) return edge.addressee_id;
    if (edge.addressee_id === my) return edge.requester_id;
  }
  if (edge?.user_id && edge?.friend_id) {
    if (edge.user_id === my) return edge.friend_id;
    if (edge.friend_id === my) return edge.user_id;
  }
  return null;
}

export async function fetchFriendsLeaderboard(period: Period, limit = 50) {
  const my = await meId();
  if (!my) return [];

  // IMPORTANT: unwrap to array
  const { data: edges, error: edgesErr } = await getFriendships();
  if (edgesErr) throw edgesErr;
  const list = edges ?? [];

  // Build friend set (only accepted)
  const friendIds = new Set<string>();
  for (const e of list) {
    if (e?.status !== "accepted") continue;
    const other =
      e.requester_id === my ? e.addressee_id :
      e.addressee_id === my ? e.requester_id : null;
    if (other) friendIds.add(other);
  }

  // Include me so I always see myself
  const ids = Array.from(new Set([my, ...friendIds]));
  if (ids.length === 0) return [];

  const key = orderKey(period);
  const { data, error } = await supabase
    .from("leaderboards")
    .select(`
      user_id,
      xp_alltime,
      xp_7d,
      xp_30d,
      profile:profiles(id, username, name, avatar_url, level, xp)
    `)
    .in("user_id", ids)
    .order(key, { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
export async function fetchGlobalLeaderboard(period: Period, limit = 50) {

  // Join aggregates + profile basics
  const { data, error } = await supabase
    .from("leaderboards")
    .select(`
      user_id,
      xp_alltime,
      xp_7d,
      xp_30d,
      profile:profiles(id, username, name, avatar_url, level, xp)
    `)
    .order(orderKey(period), { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as LeaderRow[];
}
