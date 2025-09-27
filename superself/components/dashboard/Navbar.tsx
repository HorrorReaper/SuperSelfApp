"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; // or use the helper at the bottom

type Props = {
  title?: string;
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  xpPct: number; // 0..1
  rightSlot?: React.ReactNode; // e.g., <UserButton />
  className?: string;
};

export function NavBar({
  title = "30‑Day Challenge",
  level,
  xpInLevel,
  xpNeeded,
  xpPct,
  rightSlot,
  className,
}: Props) {
  const pathnameRaw = usePathname() || "/";
  const pathname = pathnameRaw.replace(/\/+$/, ""); // normalize trailing slash

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/journeys/self-improvement-journey", label: "Journey" },
  ];

  const pct = Math.round(Math.min(1, Math.max(0, xpPct)) * 100);

  const isActive = (href: string) =>
    pathname === href.replace(/\/+$/, "");

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Mounted flag for portal to avoid SSR mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden",
        className
      )}
    >
      <div className="mx-0 sm:mx-auto max-w-screen-sm h-12 px-3 flex items-center gap-3">
        {/* Mobile: level + xp on left */}
        <div className="flex items-center gap-3 sm:hidden">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
            Lv {level}
          </span>
          <div className="flex items-center gap-2">
            <div
              className="relative h-2 w-24 overflow-hidden rounded-full bg-muted"
              aria-label={`XP progress: ${pct}%`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              title={`${xpInLevel}/${xpNeeded} XP`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        {/* Left: app title */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
          <span className="truncate font-medium">{title}</span>
        </div>

        {/* Center: nav links */}
  <nav aria-label="Primary" className="ml-3 hidden sm:flex sm:items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer",
                isActive(l.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              {l.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("px-3 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer")}>
                Social
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/friends" className="w-full cursor-pointer">Friends</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/groups" className="w-full cursor-pointer">Groups</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leaderboard" className="w-full cursor-pointer">Leaderboard</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Hubs dropdown (desktop) - keep open while hovering or focusing */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("px-3 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer")}>
                Hubs
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/hubs/productivity" className="w-full cursor-pointer">Productivity hub</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hubs/learning" className="w-full cursor-pointer">Learning hub</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hubs/fitness" className="w-full cursor-pointer">Fitness hub</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right: level/xp + user button */}
        <div className="ml-auto flex items-center gap-3">
          {/* Desktop: level + xp on right */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
              Lv {level}
            </span>
            <div className="flex items-center gap-2">
              <div
                className="relative h-2 w-40 overflow-hidden rounded-full bg-muted"
                aria-label={`XP progress: ${pct}%`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                title={`${xpInLevel}/${xpNeeded} XP`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {xpInLevel}/{xpNeeded} XP
              </span>
            </div>
          </div>

          {rightSlot}
        </div>
      </div>

      {/* Mobile footer menu: portal-mounted so it's fixed to the viewport bottom */}
      {mounted && createPortal(
        <div className="sm:hidden">
          {/* Backdrop when open - covers screen and closes menu on tap */}
          {mobileOpen ? (
            <div
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
          ) : null}

          <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="w-full max-w-screen-sm px-4 pb-4 pointer-events-auto">
              <div className="relative flex items-end justify-center">
                {/* Popup panel with subtle animation */}
                <div
                  className={`absolute bottom-14 w-full transform transition-all duration-200 ${mobileOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}
                  aria-hidden={!mobileOpen}
                >
                  <div className="bg-background/90 backdrop-blur border rounded-xl p-2 shadow-lg">
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => { setMobileOpen(false); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('openMoodCheckin')); }} className="px-2 py-2 text-center rounded-md text-sm text-muted-foreground hover:bg-muted/70">Journal</button>
                      {links.map((l) => (
                        <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="px-2 py-2 text-center rounded-md text-sm text-muted-foreground hover:bg-muted/70">{l.label}</Link>
                      ))}
                      <Link href="/friends" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-center rounded-md text-sm text-muted-foreground hover:bg-muted/70">Friends</Link>
                      <Link href="/groups" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-center rounded-md text-sm text-muted-foreground hover:bg-muted/70">Groups</Link>
                      <Link href="/leaderboard" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-center rounded-md text-sm text-muted-foreground hover:bg-muted/70">Board</Link>
                    </div>
                  </div>
                </div>

                {/* Central FAB */}
                <button
                  onClick={(e) => { e.stopPropagation(); setMobileOpen((s) => !s); }}
                  aria-expanded={mobileOpen}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  className="-mt-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg ring-4 ring-background/80"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M12 5v14M5 12h14'} /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
