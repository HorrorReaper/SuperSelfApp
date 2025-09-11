// components/streak-hero.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/sichallenge/sparkline"; // your SVG sparkline
import { plural } from "@/lib/ui";
import { Progress } from "@/components/ui/progress";

type Props = {
  name?: string;                 // optional user's first name
  day: number;                   // 1..30
  streak: number;                // consecutive days
  adherencePct: number;          // 0..100
  last7: number[];               // sparkline data (minutes per day)
  isOverall?: boolean;           // if true, show generic welcome text
};

export function StreakHero({ name, day, streak, adherencePct, last7, isOverall }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-xl"
         style={{
     backgroundImage: "url(/quotes/bg1.jpg)",
     backgroundSize: "cover",
     backgroundPosition: "center",
     backgroundRepeat: "no-repeat",
        }}>
   {/* darken overlay for readability */}
   <div className="absolute inset-0 bg-black/40" />
      {/* subtle pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{ backgroundImage: "radial-gradient(circle at 20% 10%, white 0%, transparent 40%)" }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm/5 opacity-90">{name ? `Hi, ${name}` : "Welcome back"}</div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Day {day}/30
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MetricPill label="Streak" valuee={`${streak} 🔥`} />
          <MetricPill label="Adherence" valuee={`${adherencePct}%`} adherencePct={adherencePct} />
          {isOverall ? null :(<div className="bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide opacity-90">Last 7 days</div>
              <div className="text-sm">{sum(last7)}m</div>
            </div>
            <div className="text-white">
              <Sparkline data={last7} width={120} height={34} strokeWidth={2} />
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, valuee, adherencePct }: { label: string; valuee: string; adherencePct?: number }) {
  return (
    <div className="bg-white/15 rounded-xl px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide opacity-90">{label}</div>
      <div className="text-sm font-semibold">{valuee}</div>
      {label === "Adherence" && <Progress value={adherencePct} />}
    </div>
  );
}

function sum(a: number[]) { return a.reduce((x, y) => x + y, 0); }
