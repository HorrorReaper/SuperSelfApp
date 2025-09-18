// lib/tasks.ts
import { supabase } from "@/lib/supabase";
import { Task } from "@/lib/types";



export async function listTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function addTask(payload: { text: string; essential?: boolean; frog?: boolean; due_date?: string | null }) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function toggleTaskCompleted(id: number, completed: boolean) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function setTaskFlags(id: number, flags: Partial<Pick<Task,"essential"|"frog">>) {
  const { data, error } = await supabase
    .from("tasks")
    .update(flags)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: number) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
