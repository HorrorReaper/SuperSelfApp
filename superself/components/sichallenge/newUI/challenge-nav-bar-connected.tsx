"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { xpProgress } from "@/lib/gamification";
import { NavBar } from "@/components/dashboard/Navbar";
import { createSupabaseClient } from "@/lib/supabase";

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
  const [data, setData] = useState(() => {
    const s = loadState<ChallengeState>();
    const xp = s?.xp ?? 0;
    const p = xpProgress(xp);
    return { level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct };
  });

  useEffect(() => {
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
        const supabase = createSupabaseClient();
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes?.user) {
          updateFromLocal();
          return;
        }
        const userId = userRes.user.id;
        const { data, error } = await supabase.from("profiles").select("xp").eq("id", userId).single();
        if (error || !data) {
          updateFromLocal();
          return;
        }
        const xp = data.xp ?? 0;
        const p = xpProgress(xp);
        setData({ level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct });
      } catch (e) {
        updateFromLocal();
      }
    };

    fetchFromServer();
    // Listen to our custom event for same-tab updates
    window.addEventListener("challenge:state-updated", updateFromLocal);
    // Also listen to storage for cross-tab updates
    window.addEventListener("storage", updateFromLocal);
    return () => {
      window.removeEventListener("challenge:state-updated", updateFromLocal);
      window.removeEventListener("storage", updateFromLocal);
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
