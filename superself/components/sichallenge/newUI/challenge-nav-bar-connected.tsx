"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { xpProgress } from "@/lib/gamification";
import { NavBar } from "@/components/dashboard/Navbar";
import { supabase } from "@/lib/supabase";

export function ChallengeNavBarConnected({
  title,
  rightSlot,
}: {
  title?: string;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  // Hide the global navbar on auth pages (sign-in / sign-up and any /auth/*)
  const hide = pathname.startsWith("/auth");

  // Hooks must be called unconditionally. We still initialize state here and
  // let the effect be a no-op when `hide` is true.
  const [data, setData] = useState(() => {
    const s = loadState<ChallengeState>();
    const xp = s?.xp ?? 0;
    const p = xpProgress(xp);
    return { level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct };
  });

  useEffect(() => {
    if (hide) return; // don't attach listeners or fetch when navbar is hidden
    const updateFromLocal = () => {
      const s = loadState<ChallengeState>();
      const xp = s?.xp ?? 0;
      const p = xpProgress(xp);
      setData({ level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct });
    };

    // Try to fetch authoritative XP from Supabase (best-effort). If user not signed in
    // or the fetch fails, fall back to local state.
    const fetchFromServer = async () => {
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes?.user) {
          // not signed in -> fall back to local state
          updateFromLocal();
          return;
        }
        const userId = userRes.user.id;
        const { data, error } = await supabase.from("leaderboards").select("xp_alltime").eq("user_id", userId).single();
        if (error || !data) {
          updateFromLocal();
          return;
        }
        const xp = data.xp_alltime ?? 0;
        const p = xpProgress(xp);
        setData({ level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct });
      } catch {
        updateFromLocal();
      }
    };

    // Initial authoritative fetch
    fetchFromServer();
    // Re-fetch authoritative server XP when the app updates local state or storage changes.
    window.addEventListener("challenge:state-updated", fetchFromServer);
    window.addEventListener("storage", fetchFromServer);
    return () => {
      window.removeEventListener("challenge:state-updated", fetchFromServer);
      window.removeEventListener("storage", fetchFromServer);
    };
  }, [hide]);

  if (hide) return null;
  return (
    <NavBar
      title={title}
      level={data.level}
      xpInLevel={data.xpInLevel}
      xpNeeded={data.xpNeeded}
      xpPct={data.xpPct}
      rightSlot={rightSlot}
    />
  );
}
/*  
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
// ...existing code...
import { xpProgress } from "@/lib/gamification";
import { NavBar } from "@/components/dashboard/Navbar";
import { createSupabaseClient } from "@/lib/supabase";

// ...existing code...

export function ChallengeNavBarConnected({
  title,
  rightSlot,
}: {
  title?: string;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname?.() || "/";
  // Hide the global navbar on auth pages (sign-in / sign-up and any /auth/*)
  if (pathname.startsWith("/auth")) {
    return null;
  }

  // start from a neutral initial value; authoritative source will be Supabase
  const [data, setData] = useState(() => ({ level: 0, xpInLevel: 0, xpNeeded: 100, xpPct: 0 }));

  useEffect(() => {
    // fetch authoritative XP from Supabase and update state
    const fetchFromServer = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes?.user) {
          // not signed in -> reset to zero
          const p0 = xpProgress(0);
          setData({ level: p0.level, xpInLevel: p0.inLevel, xpNeeded: p0.needed, xpPct: p0.pct });
          return;
        }
        const userId = userRes.user.id;
        const { data, error } = await supabase.from("profiles").select("xp").eq("id", userId).single();
        const xp = (error || !data) ? 0 : (data.xp ?? 0);
        const p = xpProgress(xp);
        setData({ level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct });
      } catch (e) {
        // on unexpected error, mark as zero
        const p0 = xpProgress(0);
        setData({ level: p0.level, xpInLevel: p0.inLevel, xpNeeded: p0.needed, xpPct: p0.pct });
      }
    };

    // Fetch once on mount
    fetchFromServer();

    // Re-fetch when an update event occurs so we always use server value
    window.addEventListener("challenge:state-updated", fetchFromServer);
    window.addEventListener("storage", fetchFromServer);

    return () => {
      window.removeEventListener("challenge:state-updated", fetchFromServer);
      window.removeEventListener("storage", fetchFromServer);
    };
  }, []);

  return (
    <NavBar
      title={title}
      level={data.level}
      xpInLevel={data.xpInLevel}
      xpNeeded={data.xpNeeded}
      xpPct={data.xpPct}
      rightSlot={rightSlot}
    />
  );
}*/
