"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressTiles(props: {
  streak: number;
  adherencePct: number;
  day: number;
}) {
  const { streak, adherencePct, day } = props;
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Day</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{day}/30</CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Streak</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{streak}🔥</CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Adherence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-1">{adherencePct}%</div>
          <Progress value={adherencePct} />
        </CardContent>
      </Card>
    </div>
  );
}
