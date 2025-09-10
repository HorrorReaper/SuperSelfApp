"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/sichallenge/sparkline";

type Props = {
  title?: string;
  data: { day: number; minutes: number }[]; // last 7 entries
};

export function MinutesSparklineCard({ title = "Last 7 days", data }: Props) {
  const values = data.map((d) => d.minutes);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / (values.length || 1));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-semibold tabular-nums">{total}m</div>
          <div className="text-xs text-muted-foreground">Avg {avg}m/day</div>
        </div>
        {/* Use a color that matches your theme; text-primary drives currentColor */}
        <Sparkline data={values} className="text-primary" width={200} height={56} />
      </CardContent>
    </Card>
  );
}
