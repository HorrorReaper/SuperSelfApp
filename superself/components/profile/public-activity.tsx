// components/profile/public-activity.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchPublicActivity } from "@/lib/social";
import type { Activity } from '@/lib/types';

export function PublicActivity({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Activity[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
  try { const data = await fetchPublicActivity(userId, 20); if (mounted) setRows(data as Activity[]); }
  catch { setRows([]); }
    })();
    return () => { mounted = false; };
  }, [userId]);

  if (rows === null) return <div className="text-sm text-muted-foreground">Loading activity…</div>;
  if (!rows.length) return <div className="text-sm text-muted-foreground">Activity is private or empty.</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {rows.map((r) => {
            const label =
              r.type === "day_complete" ? `Completed day ${r.day} ${r.xp ? `(+${r.xp} XP)` : ""}` :
              r.type === "weekly_retro" ? `Weekly retro ${r.xp ? `(+${r.xp} XP)` : ""}` :
              r.type === "tiny_habit" ? `Tiny habit ${r.xp ? `(+${r.xp} XP)` : ""}` :
              r.type === "mood_checkin" ? `Mood check‑in` :
              r.type === "level_up" ? `Level up` :
              r.type === "cheer" ? (r.message ?? "Sent a cheer") : r.type;

            return (
              <li key={r.id} className="rounded-md border p-3 text-sm">
                <div>{label}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
