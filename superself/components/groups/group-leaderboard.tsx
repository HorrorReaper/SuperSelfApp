"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { fetchGroupLeaderboard, LeaderRow } from "@/lib/leaderboard";
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";

type Period = "7d" | "30d" | "alltime";

export function GroupLeaderboard({ groupId }: { groupId: number }) {
  const [period, setPeriod] = useState<Period>("7d");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGroupLeaderboard(groupId, period, 50);
      setRows(data as LeaderRow[]);
    } finally { setLoading(false); }
  }, [groupId, period]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Leaderboard</h3>
        <div className="flex gap-2">
          {(["7d","30d","alltime"] as Period[]).map(p => (
            <Button key={p} size="sm" variant={period===p?"default":"secondary"} onClick={()=>setPeriod(p)}>
              {p==="7d"?"7 days":p==="30d"?"30 days":"All‑time"}
            </Button>
          ))}
        </div>
      </div>
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div>
        : <LeaderboardList rows={rows} period={period} />}
    </div>
  );
}
