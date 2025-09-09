"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WeeklyRetroCard(props: { weekIndex: number; onOpen: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Retro</CardTitle>
        <CardDescription>Take 2 minutes to reflect and plan next week.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Three prompts: What worked? What got in the way? One tweak for next week.
      </CardContent>
      <CardFooter>
        <Button onClick={props.onOpen}>Open retro</Button>
      </CardFooter>
    </Card>
  );
}
