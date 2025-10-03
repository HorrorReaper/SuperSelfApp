"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/convert";
import { FullDayCalendar } from "./full-day-calendar";

// todayISO imported from lib/convert

type Block = { start: string; end: string; title: string; kind: string };

type PlanRow = { frog_task_id?: number | null; essential_task_ids?: number[]; blocks?: Block[]; notes?: string | null } | null;

export function PlanFAB() {
  const [open, setOpen] = useState(false);
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
  }, []);

  const hasContent = useMemo(() => {
    if (!plan) return false;
    const b = (plan.blocks ?? []) as Block[];
    return Boolean(plan.frog_task_id) || (plan.essential_task_ids ?? []).length > 0 || b.length > 0 || (plan.notes ?? "").trim().length > 0;
  }, [plan]);

  if (!plan || !hasContent) return null;

  const blocks = (plan.blocks ?? []) as Block[];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="shadow-lg">Today’s Plan</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Today’s Plan</SheetTitle>
          </SheetHeader>

          <div className="space-y-3 py-3">
            {plan.frog_task_id ? (
              <div className="text-sm">Frog: #{plan.frog_task_id}</div>
            ) : null}
            <div className="text-sm">
              Essentials: {(plan.essential_task_ids ?? []).join(", ") || "—"}
            </div>
            {plan.notes ? <div className="text-sm">Notes: {plan.notes}</div> : null}

            <div className="rounded-lg border">
              <FullDayCalendar blocks={blocks} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
