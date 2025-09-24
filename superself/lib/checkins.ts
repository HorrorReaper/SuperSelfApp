// lib/checkins.ts
import { loadState, saveState } from "@/lib/local";
import { ensureDay } from "@/lib/compute";
import type { ChallengeState, JournalField, JournalTemplate, MoodLevel } from "@/lib/types";
import { supabase } from "./supabase";

export function saveDailyCheckin(day: number, mood: MoodLevel, note?: string) {
  const s = loadState<ChallengeState>();
  if (!s) return;
  // Attach to day record and a global checkins array
  const d = ensureDay(s.days, day);
  // Save mood/energy proxy on day
  const moodScore = moodToScore(mood);
  d.mood = moodScore; // keep your existing 1..5 scale if used elsewhere
  // Store a checkins array on state
  (s as any).checkins = (s as any).checkins ?? [];
  (s as any).checkins.push({
    day,
    mood,
    note,
    createdAtISO: new Date().toISOString(),
  });
  saveState(s);
}

export function hasCheckinFor(day: number): boolean {
  const s = loadState<ChallengeState>() as any;
  const arr = s?.checkins as { day: number }[] | undefined;
  return !!arr?.some((c) => c.day === day);
}

export function moodToScore(m: MoodLevel): number {
  // Map to 1..5 for legacy fields
  switch (m) {
    case "terrible":
      return 1;
    case "not_really":
      return 2;
    case "normal":
      return 3;
    case "good":
      return 4;
    case "super":
      return 5;
    default:
      return 3;
  }
}

export async function getOrCreateTemplate() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: t } = await supabase
    .from("journal_templates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (t) return t as JournalTemplate;

  const { data: created, error } = await supabase
    .from("journal_templates")
    .insert([{ user_id: user.id, name: "Daily Journal" }])
    .select("*")
    .single();
  if (error) throw error;

  // Seed a few default fields
  const { error: fErr } = await supabase
    .from("journal_fields")
    .insert([
      { template_id: created.id, label: "Mood (1-5)", type: "scale_1_5", order_index: 0, required: true },
      { template_id: created.id, label: "Energy (1-5)", type: "scale_1_5", order_index: 1, required: false },
      { template_id: created.id, label: "Wins today", type: "short_text", order_index: 2, required: false },
      { template_id: created.id, label: "Notes", type: "long_text", order_index: 3, required: false },
    ]);
  if (fErr) throw fErr;

  return created as JournalTemplate;
}

export async function listFields(templateId: number) {
  const { data, error } = await supabase
    .from("journal_fields")
    .select("*")
    .eq("template_id", templateId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as JournalField[];
}

export async function createField(templateId: number, payload: Omit<JournalField, "id"|"template_id"|"order_index"> & { order_index?: number }) {
  const { data, error } = await supabase
    .from("journal_fields")
    .insert([{ template_id: templateId, ...payload }])
    .select("*")
    .single();
  if (error) throw error;
  return data as JournalField;
}

export async function updateField(id: number, patch: Partial<Omit<JournalField, "id"|"template_id">>) {
  const { data, error } = await supabase
    .from("journal_fields")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as JournalField;
}

export async function deleteField(id: number) {
  const { error } = await supabase.from("journal_fields").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderFields(templateId: number, orderedIds: number[]) {
  // Bulk update order_index
  const updates = orderedIds.map((id, idx) => ({ id, order_index: idx }));
  const { error } = await supabase.from("journal_fields").upsert(updates);
  if (error) throw error;
}

export async function saveEntry(templateId: number, day: number | null, answers: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Upsert by date
  const today = new Date().toISOString().slice(0,10);
  const { data, error } = await supabase
    .from("journal_entries")
    .upsert([{ user_id: user.id, template_id: templateId, day, date: today, answers }], { onConflict: "user_id,date" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getTodayEntry(templateId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const today = new Date().toISOString().slice(0,10);
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .eq("date", today)
    .maybeSingle();
  return data ?? null;
}