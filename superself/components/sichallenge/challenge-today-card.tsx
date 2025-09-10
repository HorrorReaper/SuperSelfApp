// components/challenge-today-card.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadTimer } from "@/lib/timer";

type Props = {
  title: string;
  description: string;
  targetMinutes: number;
  completed: boolean;
  onStart: () => void;
  onComplete: () => void;
  canComplete?: boolean; // new: gate completion until 80%
};

export function ChallengeTodayCard({ title, description, targetMinutes, completed, onStart, onComplete, canComplete = true }: Props) {
  const [isRunning, setIsRunning] = useState(false);

  // Poll timer state so the button label reflects whether a timer is active
  useEffect(() => {
    const update = () => {
      const t = loadTimer();
      setIsRunning(!!t?.isRunning);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{completed ? "Today: Completed ✅" : "Today’s Challenge"}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="text-sm">
          Target: <span className="font-medium">{targetMinutes} min</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="secondary" onClick={onStart}>
          {isRunning ? "Show timer" : "Start timer"}
        </Button>
        <Button onClick={onComplete} disabled={completed || !canComplete}>
          Mark done
        </Button>
      </CardFooter>
    </Card>
  );
}
