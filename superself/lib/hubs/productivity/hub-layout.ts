import { WidgetId, WidgetItem } from "@/lib/types";

// lib/hub-layout.ts
export const HUB_LAYOUT_KEY = "hub_layout_v1";
export const HUB_LAYOUT_UPDATED_EVENT = "hub:layout-updated";



export function defaultHubLayout(): WidgetItem[] {
  return [
    { id: "calendar", visible: true },
    { id: "tasks", visible: true },
    { id: "notepad", visible: true },
    { id: "timer", visible: true },
  ];
}

export function loadHubLayout(): WidgetItem[] {
  if (typeof window === "undefined") return defaultHubLayout();
  try {
    const raw = localStorage.getItem(HUB_LAYOUT_KEY);
    if (!raw) return defaultHubLayout();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultHubLayout();
    // massage unknown ids
    const allowed = new Set<WidgetId>(["calendar","tasks","notepad","timer"]);
    const filtered = parsed.filter((x: unknown) => {
      if (!x || typeof x !== "object") return false;
      const obj = x as Record<string, unknown>;
      const id = obj["id"] as string | undefined;
      const vis = obj["visible"] as unknown;
      return typeof id === "string" && allowed.has(id as WidgetId) && typeof vis === "boolean";
    });
    // ensure all default widgets exist at least once
    const have = new Set(filtered.map((x: unknown) => ((x as Record<string, unknown>)["id"] as WidgetId)));
    const missing = defaultHubLayout().filter(x => !have.has(x.id));
    return [...filtered, ...missing];
  } catch {
    return defaultHubLayout();
  }
}

export function saveHubLayout(items: WidgetItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HUB_LAYOUT_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(HUB_LAYOUT_UPDATED_EVENT));
  } catch {}
}
