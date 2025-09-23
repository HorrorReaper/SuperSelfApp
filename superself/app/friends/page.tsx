/*"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  searchProfiles,
  getFriendships,
  sendFriendRequest,
  acceptRequest,
  cancelRequest,
  blockUser,
  fetchFriendActivities,
  fetchProfilesByIds,
  meId,
  type Profile,
  type Friendship,
  type Activity,
} from "@/lib/social";

function initials(name?: string | null) {
  return (name ?? "You")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FriendsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);

  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [actors, setActors] = useState<Record<string, Profile>>({});

  useEffect(() => {
    (async () => {
      setMyId(await meId());
      await refreshFriendships();
      await refreshActivity();
    })();
  }, []);

  async function refreshFriendships() {
    const { data, error } = await getFriendships();
    if (error) toast.error(error.message);
    setFriendships(data ?? []);
  }

  async function refreshActivity() {
    const { data, error } = await fetchFriendActivities();
    if (error) {
      toast.error(error.message);
      return;
    }
    setActivities(data ?? []);
    // load actor profiles
    const ids = Array.from(new Set((data ?? []).map((a) => a.actor_id)));
    const { data: profiles } = await fetchProfilesByIds(ids);
    const map: Record<string, Profile> = {};
    (profiles ?? []).forEach((p) => (map[p.id] = p));
    setActors(map);
  }

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      const { data, error } = await searchProfiles(query);
      setSearching(false);
      if (error) return toast.error(error.message);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const pendingIncoming = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.addressee_id === myId),
    [friendships, myId]
  );
  const pendingOutgoing = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.requester_id === myId),
    [friendships, myId]
  );
  const acceptedFriendIds = useMemo(() => {
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.requester_id === myId ? f.addressee_id : f.requester_id));
  }, [friendships, myId]);
  const [friends, setFriends] = useState<Profile[]>([]);

  // NEW: collect unique user IDs involved in requests
const requestUserIds = useMemo(() => {
  const ids = new Set<string>();
  pendingIncoming.forEach((f) => ids.add(f.requester_id));
  pendingOutgoing.forEach((f) => ids.add(f.addressee_id));
  return Array.from(ids);
}, [pendingIncoming, pendingOutgoing]);

// NEW: map of userId -> profile for request rows
const [requestUserMap, setRequestUserMap] = useState<Record<string, Profile>>({});

useEffect(() => {
  (async () => {
    if (!requestUserIds.length) {
      setRequestUserMap({});
      return;
    }
    const { data } = await fetchProfilesByIds(requestUserIds);
    const map: Record<string, Profile> = {};
    (data ?? []).forEach((p) => (map[p.id] = p));
    setRequestUserMap(map);
  })();
}, [requestUserIds.join(",")]);

  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Friends</h1>

      <Tabs defaultValue="activity">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* Activity }
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Friends activity</CardTitle>
              <CardDescription>Recent wins from you and your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={refreshActivity}>Refresh</Button>
              </div>
              {!activities.length ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                activities.map((a) => {
                  const actor = actors[a.actor_id];
                  const name = actor?.name ?? actor?.username ?? "Someone";
                  const avatar = actor?.avatar_url ?? undefined;
                  const label =
                    a.type === "day_complete"
                      ? `completed Day ${a.day} ${a.xp ? `(+${a.xp} XP)` : ""}`
                      : a.type === "level_up"
                      ? `leveled up ${a.xp ? `(+${a.xp} XP)` : ""}`
                      : a.message ?? a.type;

                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div><span className="font-medium">{name}</span> {label}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends list }
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Friends</CardTitle>
              <CardDescription>Your accepted connections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!friends.length ? (
                <p className="text-sm text-muted-foreground">No friends yet.</p>
              ) : (
                friends.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar_url ?? undefined} alt={p.name ?? p.username ?? ""} />
                      <AvatarFallback>{initials(p.name ?? p.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name ?? p.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Lv {p.level} · Streak {p.streak} · Day {p.today_day}/30
                      </div>
                    </div>
                    {/* Unfriend/block actions could go here }
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests }
        <TabsContent value="requests">
  <Card>
    <CardHeader>
      <CardTitle>Friend requests</CardTitle>
      <CardDescription>Incoming and outgoing requests.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Incoming }
      <div>
        <div className="text-sm font-medium mb-2">Incoming</div>
        {!pendingIncoming.length ? (
          <p className="text-sm text-muted-foreground">No incoming requests.</p>
        ) : (
          pendingIncoming.map((f) => {
            const p = requestUserMap[f.requester_id];
            const display = p?.name ?? p?.username ?? f.requester_id.slice(0, 8) + "…";
            return (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p?.avatar_url ?? undefined} alt={display} />
                    <AvatarFallback>{initials(display)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{display}</div>
                    {p && (
                      <div className="text-xs text-muted-foreground truncate">
                        Lv {p.level} · Streak {p.streak}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      const { error } = await acceptRequest(f.id);
                      if (error) toast.error(error.message);
                      else {
                        toast.success("Request accepted");
                        await refreshFriendships();
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      const { error } = await cancelRequest(f.id);
                      if (error) toast.error(error.message);
                      else {
                        toast("Request declined");
                        await refreshFriendships();
                      }
                    }}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Separator />

      {/* Outgoing }
      <div>
        <div className="text-sm font-medium mb-2">Outgoing</div>
        {!pendingOutgoing.length ? (
          <p className="text-sm text-muted-foreground">No outgoing requests.</p>
        ) : (
          pendingOutgoing.map((f) => {
            const p = requestUserMap[f.addressee_id];
            const display = p?.name ?? p?.username ?? f.addressee_id.slice(0, 8) + "…";
            return (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p?.avatar_url ?? undefined} alt={display} />
                    <AvatarFallback>{initials(display)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{display}</div>
                    {p && (
                      <div className="text-xs text-muted-foreground truncate">
                        Lv {p.level} · Streak {p.streak}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      const { error } = await cancelRequest(f.id);
                      if (error) toast.error(error.message);
                      else {
                        toast("Request canceled");
                        await refreshFriendships();
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>


        {/* Search }
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Find friends</CardTitle>
              <CardDescription>Search by username.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search username…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {!query ? (
                <p className="text-sm text-muted-foreground">Type to search.</p>
              ) : searching ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
              ) : !results.length ? (
                <p className="text-sm text-muted-foreground">No results.</p>
              ) : (
                results.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar_url ?? undefined} alt={p.name ?? p.username ?? ""} />
                      <AvatarFallback>{initials(p.name ?? p.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.username ?? p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Lv {p.level} · Streak {p.streak}
                      </div>
                    </div>
                    {p.id === myId ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const { error } = await sendFriendRequest(p.id);
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Request sent");
                            refreshFriendships();
                          }
                        }}
                      >
                        Add friend
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}*/
"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  searchProfiles,
  getFriendships,
  sendFriendRequest,
  acceptRequest,
  cancelRequest,
  blockUser,
  fetchFriendActivities,
  fetchProfilesByIds,
  meId,
  type Profile,
  type Friendship,
  type Activity,
} from "@/lib/social";
import Link from "next/link";

function initials(name?: string | null) {
  return (name ?? "You")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FriendsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);

  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [actors, setActors] = useState<Record<string, Profile>>({});

  // NEW: the actual friends list we render
  const [friends, setFriends] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      const id = await meId();
      setMyId(id);
      await refreshFriendships();
      await refreshActivity();
    })();
  }, []);

  // Also refresh friendships once myId is known (defensive, ensures we re-derive ids)
  useEffect(() => {
    if (myId) refreshFriendships();
  }, [myId]);

  async function refreshFriendships() {
    const { data, error } = await getFriendships();
    if (error) toast.error(error.message);
    setFriendships(data ?? []);
  }

  async function refreshActivity() {
    const { data, error } = await fetchFriendActivities();
    if (error) {
      toast.error(error.message);
      return;
    }
    setActivities(data ?? []);
    // load actor profiles
    const ids = Array.from(new Set((data ?? []).map((a) => a.actor_id)));
    const { data: profiles } = await fetchProfilesByIds(ids);
    const map: Record<string, Profile> = {};
    (profiles ?? []).forEach((p) => (map[p.id] = p));
    setActors(map);
  }

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      const { data, error } = await searchProfiles(query);
      setSearching(false);
      if (error) return toast.error(error.message);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const pendingIncoming = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.addressee_id === myId),
    [friendships, myId]
  );
  const pendingOutgoing = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.requester_id === myId),
    [friendships, myId]
  );

  // UPDATED: only compute accepted ids after myId is known and de‑dupe them
  const acceptedFriendIds = useMemo(() => {
    if (!myId) return [];
    const ids = new Set<string>();
    for (const f of friendships) {
      if (f.status !== "accepted") continue;
      if (f.requester_id === myId) ids.add(f.addressee_id);
      else if (f.addressee_id === myId) ids.add(f.requester_id);
    }
    return Array.from(ids);
  }, [friendships, myId]);

  // Fetch friend profiles whenever the set of friend ids changes
  useEffect(() => {
    (async () => {
      if (!acceptedFriendIds.length) {
        setFriends([]);
        return;
      }
      const { data, error } = await fetchProfilesByIds(acceptedFriendIds);
      if (error) {
        toast.error(error.message);
        return;
      }
      setFriends(data ?? []);
    })();
    // JSON.stringify is fine here given the small array size
  }, [JSON.stringify(acceptedFriendIds)]);

  // NEW: collect unique user IDs involved in requests
  const requestUserIds = useMemo(() => {
    const ids = new Set<string>();
    pendingIncoming.forEach((f) => ids.add(f.requester_id));
    pendingOutgoing.forEach((f) => ids.add(f.addressee_id));
    return Array.from(ids);
  }, [pendingIncoming, pendingOutgoing]);

  // NEW: map of userId -> profile for request rows
  const [requestUserMap, setRequestUserMap] = useState<Record<string, Profile>>({});

  useEffect(() => {
    (async () => {
      if (!requestUserIds.length) {
        setRequestUserMap({});
        return;
      }
      const { data } = await fetchProfilesByIds(requestUserIds);
      const map: Record<string, Profile> = {};
      (data ?? []).forEach((p) => (map[p.id] = p));
      setRequestUserMap(map);
    })();
  }, [requestUserIds.join(",")]);

  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Friends</h1>

      <Tabs defaultValue="activity">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Friends activity</CardTitle>
              <CardDescription>Recent wins from you and your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={refreshActivity}>
                  Refresh
                </Button>
              </div>
              {!activities.length ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                activities.map((a) => {
                  const actor = actors[a.actor_id];
                  const name = actor?.name ?? actor?.username ?? "Someone";
                  const avatar = actor?.avatar_url ?? undefined;
                  const label =
                    a.type === "day_complete"
                      ? `completed Day ${a.day} ${a.xp ? `(+${a.xp} XP)` : ""}`
                      : a.type === "level_up"
                      ? `leveled up ${a.xp ? `(+${a.xp} XP)` : ""}`
                      : a.message ?? a.type;

                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div>
                          <span className="font-medium">{name}</span> {label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends list */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Friends</CardTitle>
              <CardDescription>Your accepted connections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!friends.length ? (
                <p className="text-sm text-muted-foreground">
                  {myId ? "No friends yet." : "Loading…"}
                </p>
              ) : (
                friends.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
<Link href={`/u/${p.username ?? p.id}`}>

                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar_url ?? undefined} alt={p.name ?? p.username ?? ""} />
                      <AvatarFallback>{initials(p.name ?? p.username)}</AvatarFallback>
                    </Avatar></Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name ?? p.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Lv {p.level} · Streak {p.streak} · Day {p.today_day}/30
                      </div>
                    </div>
                    {/* Unfriend/block actions could go here */}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Friend requests</CardTitle>
              <CardDescription>Incoming and outgoing requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Incoming */}
              <div>
                <div className="text-sm font-medium mb-2">Incoming</div>
                {!pendingIncoming.length ? (
                  <p className="text-sm text-muted-foreground">No incoming requests.</p>
                ) : (
                  pendingIncoming.map((f) => {
                    const p = requestUserMap[f.requester_id];
                    const display = p?.name ?? p?.username ?? f.requester_id.slice(0, 8) + "…";
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p?.avatar_url ?? undefined} alt={display} />
                            <AvatarFallback>{initials(display)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{display}</div>
                            {p && (
                              <div className="text-xs text-muted-foreground truncate">
                                Lv {p.level} · Streak {p.streak}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              const { error } = await acceptRequest(f.id);
                              if (error) toast.error(error.message);
                              else {
                                toast.success("Request accepted");
                                await refreshFriendships();
                              }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              const { error } = await cancelRequest(f.id);
                              if (error) toast.error(error.message);
                              else {
                                toast("Request declined");
                                await refreshFriendships();
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Separator />

              {/* Outgoing */}
              <div>
                <div className="text-sm font-medium mb-2">Outgoing</div>
                {!pendingOutgoing.length ? (
                  <p className="text-sm text-muted-foreground">No outgoing requests.</p>
                ) : (
                  pendingOutgoing.map((f) => {
                    const p = requestUserMap[f.addressee_id];
                    const display = p?.name ?? p?.username ?? f.addressee_id.slice(0, 8) + "…";
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p?.avatar_url ?? undefined} alt={display} />
                            <AvatarFallback>{initials(display)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{display}</div>
                            {p && (
                              <div className="text-xs text-muted-foreground truncate">
                                Lv {p.level} · Streak {p.streak}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              const { error } = await cancelRequest(f.id);
                              if (error) toast.error(error.message);
                              else {
                                toast("Request canceled");
                                await refreshFriendships();
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Find friends</CardTitle>
              <CardDescription>Search by username.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search username…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {!query ? (
                <p className="text-sm text-muted-foreground">Type to search.</p>
              ) : searching ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
              ) : !results.length ? (
                <p className="text-sm text-muted-foreground">No results.</p>
              ) : (
                results.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.avatar_url ?? undefined} alt={p.name ?? p.username ?? ""} />
                      <AvatarFallback>{initials(p.name ?? p.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.username ?? p.name}</div>
                      <div className="text-xs text-muted-foreground">Lv {p.level} · Streak {p.streak}</div>
                    </div>
                    {p.id === myId ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const { error } = await sendFriendRequest(p.id);
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Request sent");
                            refreshFriendships();
                          }
                        }}
                      >
                        Add friend
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
