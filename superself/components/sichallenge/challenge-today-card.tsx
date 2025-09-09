// components/challenge-today-card.tsx
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <Button variant="secondary" onClick={onStart} disabled={completed}>
          Start timer
        </Button>
        <Button onClick={onComplete} disabled={completed || !canComplete}>
          Mark done
        </Button>
      </CardFooter>
    </Card>
  );
}
