// components/profile/public-profile-header.tsx
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { meId } from "@/lib/social";
import { sendFriendRequest, acceptRequest, cancelRequest, getFriendships } from "@/lib/social";
import * as React from "react";

type Props = {
  profile: { id: string; username: string | null; name: string | null; avatar_url: string | null; level: number | null; xp: number | null };
  xp7: number;
  xp30: number;
};

export function PublicProfileHeader({ profile, xp7, xp30 }: Props) {
  const [edge, setEdge] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isMe, setIsMe] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const uid = await meId();
      if (!mounted) return;
      setIsMe(uid === profile.id);
      const edges = await getFriendships();
      const e = (edges ?? []).find((f: any) =>
        (f.requester_id === uid && f.addressee_id === profile.id)
        || (f.requester_id === profile.id && f.addressee_id === uid)
      );
      setEdge(e ?? null);
    })().catch(()=>{});
    return () => { mounted = false; };
  }, [profile.id]);

  async function addFriend() {
    setLoading(true);
    try {
      await sendFriendRequest(profile.id);
      toast.success("Friend request sent");
      const edges = await getFriendships();
      setEdge((edges ?? []).find((f: any) => (f.requester_id === (await meId()) && f.addressee_id === profile.id)) ?? null);
    } catch (e: any) {
      toast.error("Could not send request", { description: e?.message });
    } finally { setLoading(false); }
  }

  async function accept(edgeId: number) {
    setLoading(true);
    try {
      await acceptRequest(edgeId);
      toast.success("Friend request accepted");
      const edges = await getFriendships();
      setEdge((edges ?? []).find((f: any) =>
        (f.requester_id === profile.id && f.addressee_id === (await meId())) || (f.requester_id === (await meId()) && f.addressee_id === profile.id)
      ) ?? null);
    } catch (e: any) {
      toast.error("Could not accept", { description: e?.message });
    } finally { setLoading(false); }
  }

  async function cancel(edgeId: number) {
    setLoading(true);
    try {
      await cancelRequest(edgeId);
      toast("Request canceled");
      setEdge(null);
    } catch (e: any) {
      toast.error("Could not cancel", { description: e?.message });
    } finally { setLoading(false); }
  }

  function FriendAction() {
    if (isMe) return null;
    if (!edge) return <Button size="sm" onClick={addFriend} disabled={loading}>Add Friend</Button>;

    if (edge.status === "accepted") {
      return <Button size="sm" variant="secondary" disabled>Friends</Button>;
    }

    // pending: show appropriate action
    const myId = edge.requester_id; // we'll check owner by comparing with meId when we fetched (simple fallback):
    const iRequested = edge.requester_id === undefined ? false : true; // we can't easily know here; simplified logic:
    // More robust: show both Cancel and Accept depending on who is requester:
    return (
      <div className="flex gap-2">
        {edge.addressee_id === profile.id ? (
          // I am requester
          <Button size="sm" variant="secondary" onClick={() => cancel(edge.id)} disabled={loading}>Cancel</Button>
        ) : (
          // They requested me
          <>
            <Button size="sm" onClick={() => accept(edge.id)} disabled={loading}>Accept</Button>
            <Button size="sm" variant="secondary" onClick={() => cancel(edge.id)} disabled={loading}>Decline</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted ring-1 ring-border">
        {profile.avatar_url ? <Image src={profile.avatar_url} alt="" fill sizes="56px" className="object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xl font-semibold">{profile.name ?? profile.username ?? "User"}</h1>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">Lv {profile.level ?? 1}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">@{profile.username} • XP {profile.xp ?? 0} • 7d {xp7} • 30d {xp30}</div>
      </div>
      <FriendAction />
    </div>
  );
}
