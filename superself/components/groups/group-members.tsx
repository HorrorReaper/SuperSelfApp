"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchGroupMembers, updateMemberRole, removeMember, fetchMyMembership} from "@/lib/groups";
import { meId } from "@/lib/social";
import { GroupMember } from "@/lib/types";

export function GroupMembers({ groupId }: { groupId: number }) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [myRole, setMyRole] = useState<"owner"|"admin"|"member"|"none">("none");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ms, mem, uid] = await Promise.all([
        fetchGroupMembers(groupId),
        fetchMyMembership(groupId),
        meId()
      ]);
      setMembers(ms);
      const role = (mem && typeof mem.role === "string") ? (mem.role as "owner"|"admin"|"member") : "none";
      setMyRole(role);
      setMe(uid);
    } finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  async function setRole(m: GroupMember, role: "admin"|"member") {
    try {
      await updateMemberRole(m.id, role);
      toast.success(`${m.profile?.name ?? m.profile?.username ?? "Member"} → ${role}`);
      load();
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      toast.error("Failed to update role", { description: e.message });
    }
  }

  async function remove(m: GroupMember) {
    try {
      await removeMember(m.id);
      toast("Removed member");
      load();
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      toast.error("Failed to remove member", { description: e.message });
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Members</h3>
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
      <ul className="divide-y divide-border rounded-lg border bg-card">
        {members.map(m => {
          const name = m.profile?.name ?? m.profile?.username ?? "Anonymous";
          const isMe = me && m.user_id === me;
          return (
            <li key={m.id} className="flex items-center gap-3 p-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                {m.profile?.avatar_url ? (
                  <Image src={m.profile.avatar_url} alt="" fill sizes="36px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate">{name} {isMe ? <span className="text-xs text-muted-foreground">(you)</span> : null}</div>
                <div className="text-xs text-muted-foreground capitalize">{m.role}</div>
              </div>
              {(myRole === "owner" || myRole === "admin") && m.role !== "owner" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary">Manage</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Member actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {m.role !== "admin" ? (
                      <DropdownMenuItem onClick={()=>setRole(m, "admin")}>Promote to admin</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={()=>setRole(m, "member")}>Demote to member</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={()=>remove(m)}>Remove from group</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
