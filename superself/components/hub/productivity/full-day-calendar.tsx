"use client";

type Block = {
  title: string;
  kind: "focus" | "meeting" | "break" | "mobility" | "workout" | "other" | string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
};

const KIND_STYLES: Record<string, string> = {
  focus: "bg-blue-500/80",
  meeting: "bg-purple-500/80",
  break: "bg-gray-400/70",
  mobility: "bg-emerald-500/80",
  workout: "bg-orange-500/80",
  other: "bg-slate-500/80",
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}
function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function FullDayCalendar({ blocks }: { blocks: Block[] }) {
  const PX_PER_MIN = 0.8; // ~1152px for 24h (scrollable)
  const H = Math.round(1440 * PX_PER_MIN);
  const hours = Array.from({ length: 25 }, (_, h) => h);

  const items = (blocks ?? []).map((b, idx) => {
    const startMin = Math.max(0, Math.min(1439, toMinutes(b.start)));
    const endMin = Math.max(startMin + 1, Math.min(1440, toMinutes(b.end)));
    const top = Math.round(startMin * PX_PER_MIN);
    const height = Math.max(24, Math.round((endMin - startMin) * PX_PER_MIN));
    return {
      key: `${b.title}-${idx}`,
      title: b.title || "Block",
      kind: b.kind || "other",
      top,
      height,
      startMin,
      endMin,
    };
  });

  return (
    // Wrap the whole grid in the scroll container so both columns scroll together
    <div className="relative overflow-auto" style={{ maxHeight: 480 }}>
      <div className="grid grid-cols-[64px_1fr]">
        {/* Hour gutter */}
        <div className="relative">
          <div className="relative" style={{ height: H }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t text-[11px] text-muted-foreground"
                style={{ top: Math.round(h * 60 * PX_PER_MIN) }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="relative" style={{ height: H }}>
            {/* Hour lines */}
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-dashed"
                style={{ top: Math.round(h * 60 * PX_PER_MIN) }}
              />
            ))}

            {/* Blocks */}
            {items.map((it) => (
              <div
                key={it.key}
                className={[
                  "absolute left-2 right-2 rounded-md p-2 text-xs text-white shadow-sm",
                  KIND_STYLES[it.kind] || KIND_STYLES.other,
                ].join(" ")}
                style={{ top: it.top, height: it.height }}
              >
                <div className="font-medium line-clamp-1">{it.title}</div>
                <div className="opacity-90">
                  {fmt(it.startMin)}–{fmt(it.endMin)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
