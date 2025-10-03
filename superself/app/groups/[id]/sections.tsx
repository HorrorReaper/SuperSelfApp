// app/groups/[id]/sections.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GroupActivity } from "@/components/groups/group-activity";
import { GroupMembers } from "@/components/groups/group-members";
import { GroupLeaderboard } from "@/components/groups/group-leaderboard";
import { fetchGroup, fetchMyMembership, joinGroup, leaveGroup} from "@/lib/groups";
import { fetchGroupLeaderboard } from "@/lib/leaderboard";
import { xpProgress } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Group } from "@/lib/types";

export function GroupPageClient({ groupId }: { groupId: number }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberRole, setMemberRole] = useState<"owner"|"admin"|"member"|"none">("none");
  const [joining, setJoining] = useState(false);
  const [groupXp, setGroupXp] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, mem] = await Promise.all([fetchGroup(groupId), fetchMyMembership(groupId)]);
      setGroup(g);
      setMemberRole((mem?.role ?? "none") as "owner"|"admin"|"member"|"none");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error("Failed to load group", { description: err.message });
      else toast.error("Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  // Fetch aggregated group XP (sum of members' profile.xp)
  useEffect(() => {
    let mounted = true;
    fetchGroupLeaderboard(groupId, "alltime", 1000)
      .then((rows) => {
        if (!mounted) return;
        // Map by user_id to avoid counting duplicate rows for the same user
        const map = new Map<string, number>();
        (rows ?? []).forEach(r => {
          const id = r.user_id;
          if (!id) return;
          const xp = Number(r.profile?.xp ?? 0) || 0;
          const prev = map.get(id) ?? 0;
          if (xp > prev) map.set(id, xp);
        });
        const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
        setGroupXp(total);
      })
      .catch((err) => {
        console.error("fetchGroupLeaderboard failed", err);
        if (mounted) setGroupXp(null);
      });
    return () => { mounted = false; };
  }, [groupId]);

  async function onJoin() {
    setJoining(true);
    try {
      await joinGroup(groupId);
      toast.success("Joined group");
      setMemberRole("member");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error("Could not join", { description: err.message });
      else toast.error("Could not join");
    } finally { setJoining(false); }
  }

  async function onLeave() {
    setJoining(true);
    try {
      await leaveGroup(groupId);
      toast("Left group");
      setMemberRole("none");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error("Could not leave", { description: err.message });
      else toast.error("Could not leave");
    } finally { setJoining(false); }
  }

  if (!group) return <div className="text-sm text-muted-foreground">{loading ? "Loading…" : "Group not found"}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted ring-1 ring-border">
          {group.avatar_url ? <Image src={group.avatar_url} alt="" fill sizes="56px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{group.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{group.description}</p>
          <div className="mt-1">
            {groupXp == null ? (
              <span className="text-sm text-muted-foreground">Group XP: —</span>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-bold text-lg shadow">{xpProgress(groupXp).level}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{group.name}</div>
                  <div className="text-xs text-muted-foreground">Group XP: {groupXp.toLocaleString()}</div>
                  <div className="mt-2 w-64">
                    <Progress value={Math.round(xpProgress(groupXp).pct * 100)} />
                    <div className="mt-1 text-xs text-muted-foreground">{xpProgress(groupXp).inLevel}/{xpProgress(groupXp).needed} XP to next level</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          {memberRole === "none" ? (
            group.visibility === "public" ? <Button size="sm" onClick={onJoin} disabled={joining}>Join</Button> :
              <Button size="sm" variant="secondary" disabled>Private</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={onLeave} disabled={joining}>Leave</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="text-sm text-muted-foreground">
            {group.visibility === "public" ? "Public group" : "Private group"}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <GroupLeaderboard groupId={groupId} />
        </TabsContent>

        <TabsContent value="activity">
          <GroupActivity groupId={groupId} />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembers groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
