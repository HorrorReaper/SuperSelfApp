"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchGroupActivity } from "@/lib/groups";

type Row = {
  id: number;
  type: "day_complete"|"level_up"|"tiny_habit"|"weekly_retro"|"mood_checkin"|"cheer";
  created_at: string;
  day: number | null;
  xp: number | null;
  message: string | null;
  actor: { id: string; username: string | null; name: string | null; avatar_url: string | null } | null;
};

export function GroupActivity({ groupId }: { groupId: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchGroupActivity(groupId, 50);
      setRows(data as any);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [groupId]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Activity</h3>
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
      <ul className="space-y-2">
        {rows.map((r) => {
          const actorName = r.actor?.name ?? r.actor?.username ?? "Someone";
          const label =
            r.type === "day_complete" ? `Completed day ${r.day} ${r.xp ? `(+${r.xp} XP)` : ""}` :
            r.type === "weekly_retro" ? `Weekly retro ${r.xp ? `(+${r.xp} XP)` : ""}` :
            r.type === "tiny_habit" ? `Tiny habit ${r.xp ? `(+${r.xp} XP)` : ""}` :
            r.type === "mood_checkin" ? `Mood check-in` :
            r.type === "level_up" ? `Level up` :
            r.type === "cheer" ? (r.message ?? "Sent a cheer") : r.type;

          return (
            <li key={r.id} className="flex items-center gap-3 rounded-md border p-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
                {r.actor?.avatar_url ? <Image src={r.actor.avatar_url} alt="" fill sizes="32px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate"><span className="font-medium">{actorName}</span> {label}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </li>
          );
        })}
        {!rows.length && !loading ? <div className="text-sm text-muted-foreground">No activity yet.</div> : null}
      </ul>
    </div>
  );
}
