"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { fetchMyMembership, joinGroup, leaveGroup} from "@/lib/groups";
import { fetchGroupLeaderboard } from "@/lib/leaderboard";
import { xpProgress } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { Group } from "@/lib/types";
import { useRouter } from "next/navigation";

export function GroupCard({ group, onChanged }: { group: Group; onChanged?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<null | { role: string }>(null);
  const [groupXp, setGroupXp] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetchMyMembership(group.id).then(m => { if (mounted) setMember(m ? { role: m.role } : null); })
      .catch(()=>{});
    // Load group XP (sum of member xp). Best-effort; may be omitted if leaderboard query fails.
    fetchGroupLeaderboard(group.id, "alltime", 500)
      .then((rows) => {
        if (!mounted) return;
        // Dedupe by user_id then sum profile.xp to avoid duplicate rows inflating the total
        const map = new Map<string, number>();
        (rows ?? []).forEach(r => {
          const id = r.user_id;
          if (!id) return;
          const xp = Number(r.profile?.xp ?? 0) || 0;
          // keep the max xp for this user if multiple rows appear
          const prev = map.get(id) ?? 0;
          if (xp > prev) map.set(id, xp);
        });
        const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
        setGroupXp(total);
      })
      .catch((err) => {
        // Log errors so developers can spot RLS / permission problems in the console
        // Keep groupXp as null to indicate we didn't load it
        // eslint-disable-next-line no-console
        console.error("fetchGroupLeaderboard failed for group", group.id, err);
      });
    return () => { mounted = false; };
  }, [group.id]);

  async function onJoin() {
    setLoading(true);
    try {
      await joinGroup(group.id);
      toast.success(`Joined ${group.name}`);
      setMember({ role: "member" });
      onChanged?.();
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      toast.error("Could not join", { description: e.message });
    } finally { setLoading(false); }
  }

  async function onLeave() {
    setLoading(true);
    try {
      await leaveGroup(group.id);
      toast("Left group", { description: group.name });
      setMember(null);
      onChanged?.();
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      toast.error("Could not leave", { description: e.message });
    } finally { setLoading(false); }
  }

  return (
    <Card className="overflow-hidden cursor-pointer" onClick={() => router.push(`/groups/${group.id}`)}>
      <CardHeader className="flex-row items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
          {group.avatar_url ? (
            <Image src={group.avatar_url} alt="" fill sizes="48px" className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">{group.name}</CardTitle>
          <CardDescription className="truncate">{group.description}</CardDescription>
          <div className="mt-1">
            {groupXp == null ? (
              <span className="text-xs text-muted-foreground">Group XP: —</span>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-bold text-sm shadow">{xpProgress(groupXp).level}</div>
                  </div>
                  <div className="min-w-0 w-36">
                    <div className="text-xs text-muted-foreground">Group XP: {groupXp.toLocaleString()}</div>
                    <div className="mt-1">
                      <Progress value={Math.round(xpProgress(groupXp).pct * 100)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
        <div className="ml-2">
          {member ? (
            <Button size="sm" variant="secondary" disabled={loading} onClick={onLeave}>Leave</Button>
          ) : group.visibility === "public" ? (
            <Button size="sm" disabled={loading} onClick={onJoin}>Join</Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>Private</Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
