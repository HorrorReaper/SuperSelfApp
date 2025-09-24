"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { loadState, saveState, loadIntake } from "@/lib/local";
import { initChallengeState, computeStreak, adherence, ensureDay } from "@/lib/compute";
import type { ChallengeState } from "@/lib/types";
import { loadUserProfile, saveUserProfile, type UserProfile } from "@/lib/user";
import { xpProgress } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";
import { fetchAchievementCatalog, fetchMyUnlocks, type Achievement } from "@/lib/achievements/achievements-client";
import { JournalSettings } from "@/components/profile/journal-settings";

function Icon({ name }: { name?: string | null }) {
  // minimal Lucide dynamic import substitute; you can wire a proper icon map
  return <span className="inline-block h-4 w-4 mr-1 align-[-1px]">🏅</span>;
}

export default function UserPage() {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile() ?? {});
  const [state, setState] = useState<ChallengeState | null>(null);
  const [intakeGoal, setIntakeGoal] = useState<string>("");

  useEffect(() => {
    const s = loadState<ChallengeState>();
    setState(s ?? initChallengeState());
    setIntakeGoal(loadIntake<any>()?.goal ?? "");
  }, []);

  const xp = state?.xp ?? 0;
  const prog = xpProgress(xp); // { level, inLevel, needed, pct }
  const todayDay = state?.todayDay ?? 1;

  const stats = useMemo(() => {
    if (!state) return { streak: 0, adherencePct: 0, completedDays: 0 };
    const streak = computeStreak(state.days);
    const adh = adherence(state.days, state.todayDay);
    const completedDays = state.days.filter((d) => d.completed).length;
    return { streak, adherencePct: adh, completedDays };
  }, [state]);

  function handleSaveProfile() {
    saveUserProfile(profile);
    toast.success("Profile saved");
  }

  function exportData() {
    const payload = {
      exportedAtISO: new Date().toISOString(),
      profile,
      intake: loadIntake<any>() ?? {},
      state: loadState<ChallengeState>() ?? initChallengeState(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "superself-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data?.state) {
        saveState(data.state as ChallengeState);
        setState(data.state as ChallengeState);
      }
      if (data?.profile) {
        saveUserProfile(data.profile as UserProfile);
        setProfile(data.profile as UserProfile);
      }
      toast.success("Import complete");
    } catch (e: any) {
      toast.error("Import failed", { description: e?.message ?? "Invalid file" });
    } finally {
      ev.target.value = "";
    }
  }

  function resetChallenge() {
    const next = initChallengeState();
    saveState(next);
    setState(next);
    toast("Challenge reset", { description: "A fresh 30‑day journey begins." });
  }
  const [catalog, setCatalog] = useState<Achievement[]>([]);
    const [unlocks, setUnlocks] = useState<Record<string, string>>({}); // key -> date
  
    useEffect(() => {
      (async () => {
        const { data: cat } = await fetchAchievementCatalog();
        setCatalog(cat ?? []);
        const { data: u } = await fetchMyUnlocks();
        const map: Record<string, string> = {};
        (u ?? []).forEach((x) => (map[x.key] = x.unlocked_at));
        setUnlocks(map);
      })();
    }, []);
  
    const items = useMemo(() => {
      return (catalog ?? []).map((a) => ({ ...a, unlocked_at: unlocks[a.key] }));
    }, [catalog, unlocks]);
  return (
    <div className="max-w-screen-sm mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile & Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your basic information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={profile.name ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={profile.email ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
            <Input
              id="avatarUrl"
              placeholder="https://…"
              value={profile.avatarUrl ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tz">Timezone</Label>
            <Input
              id="tz"
              placeholder="e.g. Europe/Berlin"
              value={profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
              onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Challenge stats</CardTitle>
          <CardDescription>Snapshot of your progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
              Lv {prog.level}
            </span>
            <div className="relative h-2 w-48 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(prog.pct * 100)} title={`${prog.inLevel}/${prog.needed} XP`}>
              <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${Math.round(prog.pct * 100)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{prog.inLevel}/{prog.needed} XP</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Day {todayDay}/30 · Streak {stats.streak} · Adherence {Math.round(stats.adherencePct)}% · {stats.completedDays} days completed
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Export or import your data for backup.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={exportData}>Export JSON</Button>
            <div>
              <Label className="mr-2">Import JSON</Label>
              <Input type="file" accept="application/json" onChange={importData} className="max-w-xs" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="text-sm text-rose-600 font-medium">Danger zone</div>
            <Button variant="destructive" onClick={resetChallenge}>Reset 30‑day challenge</Button>
          </div>
        </CardContent>
      </Card>
      <h1 className="text-2xl font-semibold">Achievements</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your achievements</CardTitle>
          <CardDescription>Keep leveling up your habits. New achievements unlock automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          {!items.length ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((a) => {
                const unlocked = !!a.unlocked_at;
                return (
                  <div
                    key={a.key}
                    className={`rounded-lg border p-3 ${unlocked ? "bg-emerald-50/40 border-emerald-200" : "bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon name={a.icon ?? undefined} />
                        <div className="font-medium">{a.title}</div>
                      </div>
                      <Badge variant={unlocked ? "default" : "secondary"}>
                        {unlocked ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                    {a.description && (
                      <div className="text-sm text-muted-foreground mt-1">{a.description}</div>
                    )}
                    {!unlocked && a.target ? (
                      <div className="text-xs text-muted-foreground mt-2">
                        Goal: {a.target}
                      </div>
                    ) : null}
                    {unlocked && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Unlocked {new Date(a.unlocked_at!).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <JournalSettings />
    </div>
  );
}
