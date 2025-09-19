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

export async function addTask(payload: {
  text: string;
  essential?: boolean;
  frog?: boolean;
  due_date?: string | null;
}) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw authErr ?? new Error("Not signed in");

  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      user_id: user.id,                      // <-- add this
      text: payload.text,
      essential: !!payload.essential,
      frog: !!payload.frog,
      due_date: payload.due_date ?? null,
    }])
    .select("*")
    .single();

  if (error) throw error;
  return data;
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
