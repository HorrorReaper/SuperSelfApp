// lib/notes.ts
import { supabase } from "@/lib/supabase";
import { Note } from "@/lib/types";



export async function getOrCreateScratchpad() {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw authErr ?? new Error("Not signed in");

  // Try fetch
  const { data: existing, error: selErr } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_scratchpad", true)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing as Note;

  // Create
  const { data: created, error: insErr } = await supabase
    .from("notes")
    .insert([{
      user_id: user.id,
      title: "Scratchpad",
      content: "",
      is_scratchpad: true,
    }])
    .select("*")
    .single();

  if (insErr) throw insErr;
  return created as Note;
}

export async function saveScratchpad(content: string, title?: string | null) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw authErr ?? new Error("Not signed in");

  // Update existing scratchpad (assumes unique index on is_scratchpad)
  const { data, error } = await supabase
    .from("notes")
    .update({
      content,
      ...(typeof title !== "undefined" ? { title } : {}),
    })
    .eq("user_id", user.id)
    .eq("is_scratchpad", true)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Note | null;
}
