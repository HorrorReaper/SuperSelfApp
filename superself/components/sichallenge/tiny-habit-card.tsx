"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  habitType: "timeboxing" | "lights_down" | "mobility";
  day: number;
  done: boolean;
  onComplete: (done: boolean) => void;
};

const LABELS: Record<Props["habitType"], { title: string; desc: string; cta?: string }> = {
  timeboxing: {
    title: "Tiny Habit: Timebox tomorrow",
    desc: "Pick tomorrow’s top task and schedule 15–25 minutes.",
    cta: "Open calendar",
  },
  lights_down: {
    title: "Tiny Habit: Lights‑down hour",
    desc: "Dim lights and reduce screens before your sleep window.",
    cta: "Set reminder",
  },
  mobility: {
    title: "Tiny Habit: 2‑minute mobility",
    desc: "Loosen up with a quick set: neck rolls, hip circles, or calf stretch.",
    cta: "Start 2‑min timer",
  },
};

export function TinyHabitCard({ habitType, done, onComplete }: Props) {
  const cfg = LABELS[habitType];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{cfg.title}</CardTitle>
        <CardDescription>{cfg.desc}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Checkbox checked={done} onCheckedChange={(v) => onComplete(Boolean(v))} />
        <div className="text-sm">{done ? "Completed today" : "Mark done when completed"}</div>
        <div className="ml-auto">
          {cfg.cta ? (
            <Button variant="secondary" onClick={() => alert(`${cfg.cta} (stub)`)}>{cfg.cta}</Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
