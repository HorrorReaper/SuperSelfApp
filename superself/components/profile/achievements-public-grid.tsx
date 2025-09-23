// components/profile/achievements-public-grid.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchPublicAchievements} from "@/lib/social";
import { PublicAchievement } from "@/lib/types";

export function AchievementsPublicGrid({ userId }: { userId: string }) {
  const [rows, setRows] = useState<PublicAchievement[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPublicAchievements(userId);
        if (mounted) setRows(data);
      } catch { setRows([]); }
    })();
    return () => { mounted = false; };
  }, [userId]);

  if (rows === null) return <div className="text-sm text-muted-foreground">Loading achievements…</div>;
  if (!rows.length) return <div className="text-sm text-muted-foreground">Achievements are private or none to show.</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rows.map((a) => {
            const unlocked = !!a.unlocked_at;
            return (
              <div key={a.key} className={`rounded-md border p-3 ${unlocked ? "" : "opacity-60"}`}>
                <div className="text-sm font-medium truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{a.description}</div>
                <div className="mt-1 text-xs">{unlocked ? new Date(a.unlocked_at!).toLocaleDateString() : "Locked"}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
