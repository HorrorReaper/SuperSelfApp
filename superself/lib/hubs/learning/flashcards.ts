// lib/flashcards.ts
import { supabase } from "@/lib/supabase";
import { Card, Deck } from "@/lib/types";



export async function listDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("flashcard_decks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createDeck(payload: { title: string; description?: string }) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw authErr ?? new Error("Not signed in");
  const { data, error } = await supabase
    .from("flashcard_decks")
    .insert([{ user_id: user.id, title: payload.title, description: payload.description ?? null }])
    .select("*")
    .single();
  if (error) throw error;
  return data as Deck;
}

export async function deleteDeck(id: number) {
  const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);
  if (error) throw error;
}

export async function listCards(deckId: number): Promise<Card[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCard(deckId: number, payload: { front: string; back: string; card_type?: "basic"|"true_false"|"typing"; tags?: string[] }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("flashcards")
    .insert([{
      deck_id: deckId,
      user_id: user.id,
      front: payload.front,
      back: payload.back,
      card_type: payload.card_type ?? "basic",
      tags: payload.tags ?? [],
    }])
    .select("*")
    .single();
  if (error) throw error;
  return data as Card;
}

export async function updateCard(id: number, patch: Partial<Pick<Card,"front"|"back"|"card_type"|"tags">>) {
  const { data, error } = await supabase.from("flashcards").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Card;
}

export async function deleteCard(id: number) {
  const { error } = await supabase.from("flashcards").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Fetch a small batch of due cards (or random if none due)
 */
export async function getPracticeBatch(deckId: number, limit = 15) {
  // First due
  const { data: due, error: err1 } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .lte("due_date", new Date().toISOString().slice(0,10))
    .order("due_date", { ascending: true })
    .limit(limit);
  if (err1) throw err1;

  if (due && due.length) return due as Card[];

  // Fallback: random recent
  const { data: rnd, error: err2 } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (err2) throw err2;
  return rnd ?? [];
}

/**
 * Apply a simple Leitner-like schedule
 * box 0->1->2->3->4->5 with intervals [1,2,5,9,15] days; wrong resets to 0 (due today)
 */
export function nextSchedule(card: Card, correct: boolean) {
  const intervals = [1, 2, 5, 9, 15];
  let box = card.box || 0;
  let interval = card.interval_days || 0;

  if (correct) {
    box = Math.min(5, box + 1);
    const idx = Math.max(0, Math.min(5, box)) - 1;
    interval = idx >= 0 ? intervals[idx] : 0;
  } else {
    box = 0;
    interval = 0;
  }

  const today = new Date();
  const due = new Date(today);
  if (interval > 0) due.setDate(today.getDate() + interval);
  return {
    box,
    interval_days: interval,
    due_date: interval > 0 ? due.toISOString().slice(0,10) : today.toISOString().slice(0,10)
  };
}

/**
 * Record a review outcome, update SRS fields and counters
 */
export async function recordReview(cardId: number, correct: boolean) {
  // Fetch current card
  const { data: card, error: err } = await supabase.from("flashcards").select("*").eq("id", cardId).single();
  if (err) throw err;
  const sched = nextSchedule(card as Card, correct);

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      box: sched.box,
      interval_days: sched.interval_days,
      due_date: sched.due_date,
      last_reviewed_at: new Date().toISOString(),
      total_reviews: (card as any).total_reviews + 1,
      correct_reviews: (card as any).correct_reviews + (correct ? 1 : 0),
    })
    .eq("id", cardId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Card;
}

/**
 * Track session for analytics (and XP)
 */
export async function startSession(deckId: number | null, mode: "flip"|"true_false"|"typing") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("flashcard_sessions")
    .insert([{ user_id: user.id, deck_id: deckId, mode }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function finishSession(sessionId: number, totals: { total: number; correct: number }) {
  const { data, error } = await supabase
    .from("flashcard_sessions")
    .update({ total: totals.total, correct: totals.correct, ended_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
