import { supabase } from "@/lib/supabase";
import { Exercise, WorkoutSession, WorkoutSet } from "@/lib/types";




export async function startSession(title?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert([{ user_id: user.id, title: title ?? null }])
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function finishSession(sessionId: number) {
  // compute total volume
  const { data: sets, error: sErr } = await supabase
    .from("workout_sets")
    .select("volume")
    .eq("session_id", sessionId);
  if (sErr) throw sErr;
  const vol = (sets ?? []).reduce((sum, s: unknown) => {
    const obj = (s as Record<string, unknown>) || {};
    const v = Number(obj["volume"] ?? 0) || 0;
    return sum + v;
  }, 0);
  const { data, error } = await supabase
    .from("workout_sessions")
    .update({ ended_at: new Date().toISOString(), total_volume: vol })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function addSet(sessionId: number, payload: Partial<WorkoutSet>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("workout_sets")
    .insert([{
      session_id: sessionId,
      user_id: user.id,
      exercise_id: payload.exercise_id ?? null,
      custom_exercise: payload.custom_exercise ?? null,
      set_index: payload.set_index ?? 1,
      weight: payload.weight ?? null,
      reps: payload.reps ?? null,
      rpe: payload.rpe ?? null,
      notes: payload.notes ?? null,
    }])
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkoutSet;
}

export async function listSessions(date?: string) {
  let q = supabase.from("workout_sessions").select("*").order("started_at", { ascending: false });
  if (date) q = q.eq("date", date);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as WorkoutSession[];
}

export async function listSets(sessionId: number) {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("session_id", sessionId)
    .order("set_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkoutSet[];
}

export async function listExercises() {
  const { data, error } = await supabase.from("exercises").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Exercise[];
}

export async function addExercise(name: string, muscle_group?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("exercises")
    .insert([{ user_id: user.id, name, muscle_group: muscle_group ?? null }])
    .select("*")
    .single();
  if (error) throw error;
  return data as Exercise;
}
