// components/day-scroller.tsx
"use client";

type DayChip = { day: number; label: string; weekday: string; isToday: boolean };

type Props = {
  currentDay: number;                 // 1..30
  onPick?: (day: number) => void;     // optional action when user taps a day
};

export function DayScroller({ currentDay, onPick }: Props) {
  const days: DayChip[] = Array.from({ length: 7 }).map((_, i) => {
    const day = Math.max(1, currentDay - 3) + i;
    const d = new Date();
    d.setDate(d.getDate() - (currentDay - day));
    const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
    const label = d.getDate().toString();
    return { day, label, weekday, isToday: day === currentDay };
  });

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => (
        <button
          key={d.day}
          onClick={() => onPick?.(d.day)}
          className={[
            "min-w-[56px] rounded-2xl px-3 py-2 text-center transition",
            d.isToday
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
          ].join(" ")}
        >
          <div className="text-xs">{d.label}</div>
          <div className="text-[11px] opacity-70">{d.weekday}</div>
        </button>
      ))}
    </div>
  );
}
