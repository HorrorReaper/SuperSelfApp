"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { xpProgress } from "@/lib/gamification";
import { NavBar } from "@/components/dashboard/Navbar";

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
    const update = () => {
      const s = loadState<ChallengeState>();
      const xp = s?.xp ?? 0;
      const p = xpProgress(xp);
      setData({ level: p.level, xpInLevel: p.inLevel, xpNeeded: p.needed, xpPct: p.pct });
    };

    update();
    // Listen to our custom event for same-tab updates
    window.addEventListener("challenge:state-updated", update);
    // Also listen to storage for cross-tab updates
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("challenge:state-updated", update);
      window.removeEventListener("storage", update);
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
