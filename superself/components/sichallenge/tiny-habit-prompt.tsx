"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (type: "timeboxing" | "lights_down" | "mobility") => void;
  onSkip: () => void;
};

export function TinyHabitPrompt({ open, onOpenChange, onSelect, onSkip }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Level up with a tiny habit</DialogTitle>
          <DialogDescription>
            Keep your core routine, and add one 1–5 minute habit to amplify results. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="secondary" onClick={() => onSelect("timeboxing")}>
              Timebox tomorrow
            </Button>
            <Button variant="secondary" onClick={() => onSelect("lights_down")}>
              Lights‑down hour
            </Button>
            <Button variant="secondary" onClick={() => onSelect("mobility")}>
              2‑min mobility
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Tip: pick the one that feels 8/10 doable. You can switch anytime.
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onSkip}>
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
