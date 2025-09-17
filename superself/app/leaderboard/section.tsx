// app/leaderboard/sections.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchGlobalLeaderboard, fetchFriendsLeaderboard } from "@/lib/leaderboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";

type Period = "alltime" | "7d" | "30d";

export function LeaderboardClient() {
  const [tab, setTab] = useState<"global"|"friends">("global");
  const [period, setPeriod] = useState<Period>("7d");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = tab === "global"
        ? await fetchGlobalLeaderboard(period, 50)
        : await fetchFriendsLeaderboard(period, 50);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab, period]);

  const PeriodSwitch = useMemo(() => (
    <div className="flex gap-2">
      {(["7d","30d","alltime"] as Period[]).map(p => (
        <Button key={p} size="sm" variant={period===p?"default":"secondary"} onClick={() => setPeriod(p)}>
          {p==="7d"?"7d":p==="30d"?"30d":"All‑time"}
        </Button>
      ))}
    </div>
  ), [period]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leaderboard</h1>
        {PeriodSwitch}
      </div>

      <Tabs value={tab} onValueChange={(v)=>setTab(v as any)} className="space-y-3">
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> :
            <LeaderboardList rows={rows} period={period} />}
        </TabsContent>

        <TabsContent value="friends">
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> :
            rows.length ? <LeaderboardList rows={rows} period={period} /> :
            <div className="text-sm text-muted-foreground">No friends yet. Add some in the Friends tab!</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
