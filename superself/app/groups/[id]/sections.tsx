// app/groups/[id]/sections.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GroupActivity } from "@/components/groups/group-activity";
import { GroupMembers } from "@/components/groups/group-members";
import { GroupLeaderboard } from "@/components/groups/group-leaderboard";
import { fetchGroup, fetchMyMembership, joinGroup, leaveGroup} from "@/lib/groups";
import { toast } from "sonner";
import { Group } from "@/lib/types";

export function GroupPageClient({ groupId }: { groupId: number }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberRole, setMemberRole] = useState<"owner"|"admin"|"member"|"none">("none");
  const [joining, setJoining] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [g, mem] = await Promise.all([fetchGroup(groupId), fetchMyMembership(groupId)]);
      setGroup(g);
      setMemberRole((mem?.role as any) ?? "none");
    } catch (e: any) {
      toast.error("Failed to load group", { description: e?.message });
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [groupId]);

  async function onJoin() {
    setJoining(true);
    try {
      await joinGroup(groupId);
      toast.success("Joined group");
      setMemberRole("member");
    } catch (e: any) {
      toast.error("Could not join", { description: e?.message });
    } finally { setJoining(false); }
  }

  async function onLeave() {
    setJoining(true);
    try {
      await leaveGroup(groupId);
      toast("Left group");
      setMemberRole("none");
    } catch (e: any) {
      toast.error("Could not leave", { description: e?.message });
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
