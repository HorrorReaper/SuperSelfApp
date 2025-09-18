"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { fetchMyMembership, joinGroup, leaveGroup} from "@/lib/groups";
import { Group } from "@/lib/types";
import { useRouter } from "next/navigation";

export function GroupCard({ group, onChanged }: { group: Group; onChanged?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<null | { role: string }>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetchMyMembership(group.id).then(m => { if (mounted) setMember(m ? { role: m.role } : null); })
      .catch(()=>{});
    return () => { mounted = false; };
  }, [group.id]);

  async function onJoin() {
    setLoading(true);
    try {
      await joinGroup(group.id);
      toast.success(`Joined ${group.name}`);
      setMember({ role: "member" });
      onChanged?.();
    } catch (e: any) {
      toast.error("Could not join", { description: e?.message });
    } finally { setLoading(false); }
  }

  async function onLeave() {
    setLoading(true);
    try {
      await leaveGroup(group.id);
      toast("Left group", { description: group.name });
      setMember(null);
      onChanged?.();
    } catch (e: any) {
      toast.error("Could not leave", { description: e?.message });
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
