import { supabase } from "./supabase";
import type { TinyHabitConfig, TinyHabitCompletion } from "./types";

export async function upsertTinyHabitForUser(userId: string, journey = "30 Day Self Improvement Challenge", config?: TinyHabitConfig | null, completions?: TinyHabitCompletion[] | null) {
  try {
    const payload: { user_id: string; journey: string; config?: TinyHabitConfig | null; completions?: TinyHabitCompletion[] | null } = { user_id: userId, journey };
    if (config !== undefined) payload.config = config;
    if (completions !== undefined) payload.completions = completions;
    const { data, error } = await supabase.from("tiny_habits").upsert(payload, { onConflict: "user_id,journey" });
    return { data, error };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

export async function getTinyHabitForUser(userId: string, journey = "30 Day Self Improvement Challenge") {
  try {
    const { data, error } = await supabase.from("tiny_habits").select("config,completions").eq("user_id", userId).eq("journey", journey).single();
    return { data, error };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}
