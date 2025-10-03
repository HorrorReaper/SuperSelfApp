// components/hub/nextday-execute.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/convert";

export function NextDayExecute() {
  const router = useRouter();
  type PlanRow = { frog_task_id?: number | null; blocks?: { start?: string; end?: string; title?: string; kind?: string }[]; } | null;
  const [plan, setPlan] = useState<PlanRow>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_date", todayISO())
        .maybeSingle();
      setPlan(data ?? null);
    })();
  // supabase is a stable singleton; do not include it in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stable singleton
  }, []);

  if (!plan) return (
    <Card>
      <CardHeader><CardTitle>Today’s Plan</CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">No plan for today yet.</div>
        <Button className="mt-2" onClick={()=>router.push("/plan-next-day")}>Plan tomorrow</Button>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader><CardTitle>Today’s Plan</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {plan.frog_task_id ? <div className="text-sm">Frog: {plan.frog_task_id}</div> : null}
        <div className="space-y-1">
          {plan.blocks?.map((b, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm rounded-md border p-2">
              <div>{b.start}–{b.end} • {b.title}</div>
              {b.kind === "focus" ? (
                <Button size="sm" onClick={()=>router.push("/focus")}>Start Focus</Button>
              ) : b.kind === "mobility" ? (
                <Button size="sm" onClick={()=>toast("Mobility", { description: "Open mobility card to start the 2-min timer." })}>Do Mobility</Button>
              ) : null}
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={()=>router.push("/hubs/productivity/plan-next-day")}>Edit Plan</Button>
      </CardContent>
    </Card>
  );
}
