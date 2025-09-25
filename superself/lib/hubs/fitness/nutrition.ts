// lib/nutrition.ts

import { supabase } from "@/lib/supabase";
import { Meal } from "@/lib/types";



export async function addMeal(payload: Partial<Meal>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("meals")
    .insert([{
      user_id: user.id,
      name: payload.name ?? null,
      calories: payload.calories ?? 0,
      protein_g: payload.protein_g ?? 0,
      carbs_g: payload.carbs_g ?? 0,
      fat_g: payload.fat_g ?? 0,
      notes: payload.notes ?? null,
      date: payload.date ?? new Date().toISOString().slice(0,10),
      time: payload.time ?? null,
    }])
    .select("*")
    .single();
  if (error) throw error;
  return data as Meal;
}

export async function listMeals(date?: string) {
  let q = supabase.from("meals").select("*").order("time", { ascending: true });
  if (date) q = q.eq("date", date);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Meal[];
}

export function totals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein_g += Number(m.protein_g || 0);
      acc.carbs_g += Number(m.carbs_g || 0);
      acc.fat_g += Number(m.fat_g || 0);
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}
// lib/nutrition.ts (add)
export async function deleteMeal(id: number) {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}
export async function getMacroTargets() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("macro_targets")
    .eq("id", user.id)
    .single();

  return (data?.macro_targets ?? null) as {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;
}

