"use client";
import { useEffect, useState, useCallback } from "react";
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGroupActivity(groupId, 50);
      // defensive transformation: Supabase may return joined `actor` as an array or object
      const raw = (data ?? []) as unknown[];
      const normalized: Row[] = raw.map((r) => {
        const rr = r as Record<string, unknown>;
        const actorRaw = rr.actor;
        let actor = null as Row['actor'];
        if (actorRaw) {
          if (Array.isArray(actorRaw)) {
            const first = actorRaw[0] as Record<string, unknown> | undefined;
            actor = first
              ? { id: String(first.id ?? ""), username: (first.username as string) ?? null, name: (first.name as string) ?? null, avatar_url: (first.avatar_url as string) ?? null }
              : null;
          } else {
            const aObj = actorRaw as Record<string, unknown>;
            actor = { id: String(aObj.id ?? ""), username: (aObj.username as string) ?? null, name: (aObj.name as string) ?? null, avatar_url: (aObj.avatar_url as string) ?? null };
          }
        }

        return {
          id: Number(rr.id ?? 0),
          type: (rr.type as Row['type']) ?? "day_complete",
          created_at: String(rr.created_at ?? ""),
          day: rr.day == null ? null : Number(rr.day),
          xp: rr.xp == null ? null : Number(rr.xp),
          message: rr.message == null ? null : String(rr.message),
          actor,
        };
      });
      setRows(normalized);
    } finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

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
