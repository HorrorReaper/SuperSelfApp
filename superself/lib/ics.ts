// lib/ics.ts
export type ICSOptions = {
  title: string;
  description?: string;
  location?: string;
  start: Date; // local start time, we’ll store as UTC in ICS
  durationMinutes: number;
  allDay?: boolean;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function toICSDateUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

export function buildICS(opts: ICSOptions) {
  const uid = `${crypto.randomUUID()}@superself`;
  const now = new Date();
  const dtstamp = toICSDateUTC(now);

  const start = opts.allDay
    ? new Date(Date.UTC(opts.start.getFullYear(), opts.start.getMonth(), opts.start.getDate(), 0, 0, 0))
    : new Date(opts.start);
  const end = opts.allDay
    ? new Date(Date.UTC(opts.start.getFullYear(), opts.start.getMonth(), opts.start.getDate() + 1, 0, 0, 0))
    : new Date(start.getTime() + opts.durationMinutes * 60_000);

  const dtstart = toICSDateUTC(start);
  const dtend = toICSDateUTC(end);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SuperSelf//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    opts.description ? `DESCRIPTION:${escapeICS(opts.description)}` : "",
    opts.location ? `LOCATION:${escapeICS(opts.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  // Use CRLF for broad calendar compatibility
  return lines.join("\r\n");
}

function escapeICS(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function downloadICS(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
