// app/groups/sections.tsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupCard } from "@/components/groups/group-card";
import { fetchMyGroups, fetchPublicGroups} from "@/lib/groups";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Group } from "@/lib/types";

export function GroupsListClient() {
  const [tab, setTab] = useState<"mine"|"discover">("mine");
  const [mine, setMine] = useState<Group[]>([]);
  const [discover, setDiscover] = useState<Group[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "mine") {
        setMine(await fetchMyGroups());
      } else {
        setDiscover(await fetchPublicGroups(50, q));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === "discover") load();
    }, 350);
    return () => clearTimeout(t);
  }, [q, load, tab]); // debounce query

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Groups</h1>
        <Button asChild><Link href="/groups/new">Create group</Link></Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v === "discover" ? "discover" : "mine")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="mine">My groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="mine">
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
          <div className="space-y-3">
            {mine.map(g => <GroupCard key={g.id} group={g} />)}
            {!mine.length && !loading ? (
              <div className="text-sm text-muted-foreground">You’re not in any groups yet.</div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="discover">
          <div className="flex items-center gap-2 pb-2">
            <Input placeholder="Search groups…" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
          <div className="space-y-3">
            {discover.map(g => <GroupCard key={g.id} group={g} onChanged={load} />)}
            {!discover.length && !loading ? (
              <div className="text-sm text-muted-foreground">No groups found.</div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
