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
  const rows = (data ?? []).map((r: any) => {
    const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    return {
      user_id: r.user_id,
      xp_alltime: r.xp_alltime ?? 0,
      xp_7d: r.xp_7d ?? 0,
      xp_30d: r.xp_30d ?? 0,
      profile,
    } as LeaderRow;
  });
  return rows;
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
  const rows = (data ?? []).map((r: any) => {
    const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    return {
      user_id: r.user_id,
      xp_alltime: r.xp_alltime ?? 0,
      xp_7d: r.xp_7d ?? 0,
      xp_30d: r.xp_30d ?? 0,
      profile,
    } as LeaderRow;
  });
  return rows;
}
export async function fetchGroupLeaderboard(groupId: number, period: "7d"|"30d"|"alltime", limit = 50) {
  const key = period === "alltime" ? "xp_alltime" : period === "7d" ? "xp_7d" : "xp_30d";
  // 1) Fetch member user IDs for the group. Keep this simple so it works even without
  // a foreign-key relationship to `leaderboards` in the schema cache.
  const { data: members, error: membersErr } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);
  if (membersErr) throw membersErr;
  // Remove any duplicate user_ids from group_members before querying leaderboards
  const ids = Array.from(new Set((members ?? []).map((m: any) => m.user_id).filter(Boolean)));
  if (ids.length === 0) return [];

  // 2) Query leaderboards for those user ids and join profiles from the leaderboards side.
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

  const rows = (data ?? []).map((r: any) => {
    const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    return {
      user_id: r.user_id,
      xp_alltime: r.xp_alltime ?? 0,
      xp_7d: r.xp_7d ?? 0,
      xp_30d: r.xp_30d ?? 0,
      profile,
    } as LeaderRow;
  });

  // Defensive: dedupe rows by user_id in case the leaderboards source returns
  // multiple rows for the same user (can happen with certain views or joins).
  const unique = new Map<string, LeaderRow>();
  for (const r of rows) {
    const existing = unique.get(r.user_id);
    if (!existing) {
      unique.set(r.user_id, r);
    } else {
      // Prefer the row with the larger all-time xp (most up-to-date aggregate)
      if ((r.xp_alltime ?? 0) > (existing.xp_alltime ?? 0)) {
        unique.set(r.user_id, r);
      }
    }
  }

  return Array.from(unique.values()).slice(0, limit);
}