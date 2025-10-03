// lib/groups.ts
import { supabase } from "@/lib/supabase";
import { Group, GroupMember, GroupRole, GroupVisibility } from "./types";
import { meId } from "./social";

export async function createGroup(payload: { name: string; description?: string; visibility: GroupVisibility; avatar_url?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: g, error } = await supabase
    .from("groups")
    .insert([{ ...payload, owner_id: user.id }])
    .select("*")
    .single();
  if (error) throw error;

  const { error: mErr } = await supabase
    .from("group_members")
    .insert([{ group_id: g.id, user_id: user.id, role: "owner" }]);
  if (mErr) throw mErr;

  return g as Group;
}

export async function fetchMyGroups() {
  const uid = await meId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("group_members")
    .select(`
      group_id,
      role,
      groups:groups(
        id, slug, name, description, avatar_url, visibility, owner_id, created_at, updated_at
      )
    `)
    .eq("user_id", uid)
    .order("group_id", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((row: unknown) => {
      // RPC returns objects with a `groups` property which may itself be an object
      // or (rarely) an array when joins behave differently. Normalize safely.
      if (!row || typeof row !== "object") return null;
      const groups = (row as { groups?: unknown }).groups;
      if (Array.isArray(groups)) return groups[0] as Group;
      return groups as Group | null;
    })
    .filter(Boolean) as Group[];
}

export async function fetchPublicGroups(limit = 50, q?: string) {
  let query = supabase
    .from("groups")
    .select("id, slug, name, description, avatar_url, visibility, owner_id, created_at, updated_at")
    .eq("visibility", "public" as const)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q && q.trim()) {
    // Simple ilike on name/description
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Group[];
}

export async function fetchGroup(groupId: number) {
  const { data, error } = await supabase
    .from("groups")
    .select("id, slug, name, description, avatar_url, visibility, owner_id, created_at, updated_at")
    .eq("id", groupId)
    .single();
  if (error) throw error;
  return data as Group;
}

export async function fetchMyMembership(groupId: number) {
  const uid = await meId();
  if (!uid) return null;

  const { data, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", uid)
    .maybeSingle();

  if (error) throw error;
  return data as GroupMember | null;
}

export async function joinGroup(groupId: number) {
  const uid = await meId();
  if (!uid) throw new Error("Not signed in");
  const { error } = await supabase
    .from("group_members")
    .insert([{ group_id: groupId, user_id: uid }]);
  if (error) throw error;
}

export async function leaveGroup(groupId: number) {
  const uid = await meId();
  if (!uid) throw new Error("Not signed in");
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", uid);
  if (error) throw error;
}

export async function fetchGroupMembers(groupId: number) {
  const { data, error } = await supabase.rpc("group_members_list", { p_group_id: groupId });
  if (error) throw error;

  // Map RPC return to GroupMember-like shape (use unknown + narrow to avoid `any`)
  return (data ?? []).map((r: unknown) => {
    const obj = (r as Record<string, unknown>) || {};
    return {
      id: obj["id"] as number,
      group_id: obj["group_id"] as number,
      user_id: obj["user_id"] as string,
      role: obj["role"] as GroupRole,
      created_at: obj["created_at"] as string,
      profile: {
        id: obj["profile_id"] as string,
        username: obj["username"] as string | null,
        name: obj["name"] as string | null,
        avatar_url: obj["avatar_url"] as string | null,
        level: obj["level"] as number | null,
        xp: obj["xp"] as number | null,
      },
    } as GroupMember;
  });
}


export async function updateMemberRole(memberId: number, role: GroupRole) {
  const { error } = await supabase.from("group_members").update({ role }).eq("id", memberId);
  if (error) throw error;
}

export async function removeMember(memberId: number) {
  const { error } = await supabase.from("group_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function fetchGroupActivity(groupId: number, limit = 50) {
  // Assumes activity has group_id column and RLS allows members to view
  const { data, error } = await supabase
    .from("activity")
    .select(`
      id, actor_id, type, day, xp, message, created_at,
      actor:profiles(id, username, name, avatar_url)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
