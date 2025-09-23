// app/u/[username]/sections.tsx
"use client";
import * as React from "react";
import { fetchProfileByUsername, fetchLeaderboardSlices } from "@/lib/social";
import { PublicProfileHeader } from "@/components/profile/public-profile-header";
import { AchievementsPublicGrid } from "@/components/profile/achievements-public-grid";
import { PublicActivity } from "@/components/profile/public-activity";
import { toast } from "sonner";

export function PublicProfileClient({ username }: { username: string }) {
  const [profile, setProfile] = React.useState<any | null>(null);
  const [xp7, setXp7] = React.useState(0);
  const [xp30, setXp30] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await fetchProfileByUsername(username);
        if (!p) { toast.error("Profile not found"); return; }
        if (!mounted) return;
        setProfile(p);
        const lb = await fetchLeaderboardSlices(p.id);
        setXp7(lb?.xp_7d ?? 0);
        setXp30(lb?.xp_30d ?? 0);
      } catch (e: any) {
        toast.error("Failed to load profile", { description: e?.message });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  if (loading && !profile) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!profile) return <div className="text-sm text-muted-foreground">Profile not found.</div>;

  return (
    <div className="space-y-4">
      <PublicProfileHeader profile={profile} xp7={xp7} xp30={xp30} />
      <AchievementsPublicGrid userId={profile.id} />
      <PublicActivity userId={profile.id} />
    </div>
  );
}
