// components/leaderboard/leaderboard-list.tsx
"use client";
import Image from "next/image";

function initials(name?: string | null) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "??";
}

export function LeaderboardList({
  rows,
  period,
}: {
  rows: Array<{
    user_id: string;
    xp_alltime: number;
    xp_7d: number;
    xp_30d: number;
    profile: { id: string; username: string | null; name: string | null; avatar_url: string | null; level: number | null; xp: number | null };
  }>;
  period: "alltime" | "7d" | "30d";
}) {
  const key = period === "alltime" ? "xp_alltime" : period === "7d" ? "xp_7d" : "xp_30d";

  return (
    <ol className="divide-y divide-border rounded-lg border bg-card">
      {rows.map((r, i) => {
        const score = (r as any)[key] as number;
        const name = r.profile?.name ?? r.profile?.username ?? "Anonymous";
        const src = r.profile?.avatar_url || "";

        return (
          <li key={r.user_id} className="flex items-center gap-3 p-3">
            <span className="w-8 text-center text-sm font-medium tabular-nums">{i + 1}</span>

            {/* Avatar: crisp with fill + object-cover, fallback initials */}
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority={i < 5} // prefetch top entries a bit earlier
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  {initials(name)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate">{name}</div>
              <div className="text-xs text-muted-foreground">Lv {r.profile?.level ?? 1}</div>
            </div>

            <div className="text-right">
              <div className="text-sm tabular-nums font-semibold">{score} XP</div>
              <div className="text-xs text-muted-foreground">
                {period === "alltime" ? "All‑time" : period === "7d" ? "Last 7 days" : "Last 30 days"}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
