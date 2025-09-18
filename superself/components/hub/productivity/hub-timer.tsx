// components/hub/hub-timer.tsx
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { awardFocusSessionXP } from "@/lib/xp-server";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { TimerModal } from "@/components/sichallenge/timer-modal";

const XP_FOCUS_SESSION = 20;

export function HubTimer() {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const todayDay = (loadState<ChallengeState>()?.todayDay) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Timer</CardTitle>
        <CardDescription>Run a deep work sprint and earn XP when you finish.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Duration</div>
            <div className="text-sm">{minutes} min</div>
          </div>
          <Slider value={[minutes]} min={5} max={60} step={5} onValueChange={(v)=>setMinutes(v[0])} />
        </div>
        <Button onClick={()=>setOpen(true)}>Open Timer</Button>
      </CardContent>

      <TimerModal
        open={open}
        onOpenChange={setOpen}
        defaultMinutes={minutes}
        onFinished={async () => {
          const { error } = await awardFocusSessionXP(XP_FOCUS_SESSION, todayDay);
          if (!error || /duplicate key|unique/i.test(error.message)) {
            toast.success(`+${XP_FOCUS_SESSION} XP`, { description: "Focus session complete" });
          } else {
            toast.error("XP sync failed", { description: error.message });
          }
        }}
      />
    </Card>
  );
}
