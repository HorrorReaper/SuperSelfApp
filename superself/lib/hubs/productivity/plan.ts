// lib/nextday/plans.ts
import { supabase } from "@/lib/supabase";
import { DayPlan } from "@/lib/types";

export async function getOrCreatePlan(dateISO: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("day_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_date", dateISO)
    .maybeSingle();

  if (data) return data;

  const empty = {
    user_id: user.id,
    plan_date: dateISO,
    essential_task_ids: [],
    blocks: [],
    checklist: [],
    status: "planned",
  };
  const { data: created } = await supabase.from("day_plans").insert(empty).select("*").single();
  return created;
}

export async function savePlan(id: string, patch: Partial<DayPlan>) {
  const { data } = await supabase.from("day_plans").update(patch).eq("id", id).select("*").single();
  return data;
}
