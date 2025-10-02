"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { loadHubLayout, saveHubLayout, defaultHubLayout} from "@/lib/hubs/productivity/hub-layout";
import { HubCalendar } from "@/components/hub/productivity/hub-calendar";
import { HubTasks } from "@/components/hub/productivity/hub-tasks";
import { HubNotepad } from "@/components/hub/productivity/hub-notepad";
import { HubTimer } from "@/components/hub/productivity/hub-timer";
import { GripVertical, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { WidgetId, WidgetItem } from "@/lib/types";
import { NextDayExecute } from "@/components/hub/productivity/nextday-execute";

// Registry of widgets to render and display labels
const WIDGET_REGISTRY: Record<WidgetId, { label: string; render: () => React.ReactElement }> = {
  calendar: { label: "Calendar", render: () => <HubCalendar /> },
  tasks: { label: "Tasks", render: () => <HubTasks /> },
  notepad: { label: "Notepad", render: () => <HubNotepad /> },
  timer: { label: "Timer", render: () => <HubTimer /> },
};

export function ProductivityHubClient() {
  const router = useRouter();
  const [customize, setCustomize] = useState(false);
  const [items, setItems] = useState<WidgetItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const dragIdRef = useRef<WidgetId | null>(null);

  // initial load
  useEffect(() => {
    setItems(loadHubLayout());
    setMounted(true);
  }, []);

  // persist on change
  useEffect(() => {
    if (!mounted) return;
    saveHubLayout(items);
  }, [items, mounted]);

  function toggleVisible(id: WidgetId) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, visible: !it.visible } : it));
  }

  function resetLayout() {
    const def = defaultHubLayout();
    setItems(def);
    toast("Layout reset");
  }

  // DnD handlers
  function onDragStart(e: React.DragEvent, id: WidgetId) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", id); } catch {}
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  }
  function onDrop(e: React.DragEvent, targetId: WidgetId) {
    e.preventDefault();
    const draggedId = dragIdRef.current;
    dragIdRef.current = null;
    if (!draggedId || draggedId === targetId) return;
    setItems(prev => {
      const cur = [...prev];
      const from = cur.findIndex(x => x.id === draggedId);
      const to = cur.findIndex(x => x.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = cur.splice(from, 1);
      cur.splice(to, 0, moved);
      return cur;
    });
  }
  function onDragEnd() {
    dragIdRef.current = null;
  }

  const visibleItems = useMemo(() => items.filter(i => i.visible), [items]);

  // In customize mode we render control list with drag handles + switches.
  // In view mode we render visible widgets in the chosen order.
  return (
    <div className="space-y-4">
      {/* Quick action: Plan next day */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Plan for tomorrow</h2>
            <p className="text-sm text-muted-foreground">Create a quick plan for your next day to stay productive.</p>
          </div>
          <div className="ml-4">
            <Button onClick={() => router.push('/hubs/productivity/plan-next-day')} className="whitespace-nowrap">Plan next day</Button>
          </div>
        </div>
      </Card>
      <NextDayExecute />
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Productivity Hub</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant={customize ? "default" : "secondary"} onClick={() => setCustomize(v => !v)}>
            {customize ? "Done" : "Customize"}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetLayout} title="Reset layout">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {customize ? (
        <Card className="p-3">
          <div className="text-sm font-medium mb-2">Arrange widgets</div>
          <ul className="space-y-2">
            {items.map(it => (
              <li
                key={it.id}
                className="flex items-center gap-3 rounded-md border bg-card/70 p-2"
                draggable
                onDragStart={(e) => onDragStart(e, it.id)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, it.id)}
                onDragEnd={onDragEnd}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" aria-hidden />
                <div className="flex-1">
                  <div className="text-sm">{WIDGET_REGISTRY[it.id].label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className={`h-4 w-4 ${it.visible ? "text-emerald-500" : "text-muted-foreground/50"}`} />
                  <Switch checked={it.visible} onCheckedChange={() => toggleVisible(it.id)} />
                </div>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5" /> Hidden widgets won’t appear on the hub, but you can re‑enable them anytime.
          </div>
        </Card>
      ) : null}

      {/* Render visible widgets in chosen order */}
      <div className="space-y-4">
        {visibleItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            All widgets are hidden. Click Customize to add some back.
          </div>
        ) : visibleItems.map(it => (
          <div key={it.id}>
            {WIDGET_REGISTRY[it.id].render()}
          </div>
        ))}
      </div>
    </div>
  );
}
