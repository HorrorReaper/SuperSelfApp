// components/learning/practice-panel.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { listDecks, getPracticeBatch, recordReview, startSession, finishSession} from "@/lib/hubs/learning/flashcards";
import { awardFlashcardsXP } from "@/lib/xp-server";
import { loadState } from "@/lib/local";
import type { Card, ChallengeState, Deck } from "@/lib/types";
import { Card as UiCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Mode = "flip" | "true_false" | "typing";

export function PracticePanel() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckId, setDeckId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("flip");
  const [limit, setLimit] = useState(15);
  const [batch, setBatch] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [typed, setTyped] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [running, setRunning] = useState(false);

  const todayDay = (loadState<ChallengeState>()?.todayDay) ?? null;
  const pct = useMemo(() => batch.length ? Math.round((idx / batch.length) * 100) : 0, [idx, batch.length]);
  const current = batch[idx];

  async function loadDecks() {
    try {
      const ds = await listDecks();
      setDecks(ds);
      if (!deckId && ds[0]) setDeckId(ds[0].id);
    } catch {}
  }
  useEffect(() => { loadDecks(); }, []);

  async function begin() {
    if (!deckId) { toast.error("Pick a deck"); return; }
    setRunning(true);
    setReveal(false); setTyped(""); setCorrect(0); setIdx(0);
    const sess = await startSession(deckId, mode);
    setSessionId(sess.id);
    const cards = await getPracticeBatch(deckId, limit);
    setBatch(cards);
    if (!cards.length) toast("No cards due", { description: "We picked recent ones instead if available." });
  }

  async function endSession() {
    setRunning(false);
    if (sessionId) {
      await finishSession(sessionId, { total: batch.length, correct });
      // Award XP: 2 XP per correct, max 30
      const xp = Math.min(30, correct * 2);
      if (xp > 0) {
        const { error } = await awardFlashcardsXP(xp, todayDay);
        if (!error || /duplicate key|unique/i.test(error.message)) {
          toast.success(`+${xp} XP`, { description: "Flashcards session" });
        }
      }
    }
    setSessionId(null);
  }

  async function mark(correctAns: boolean) {
    if (!current) return;
    try { await recordReview(current.id, correctAns); } catch {}
    if (correctAns) setCorrect(x => x + 1);
    if (idx + 1 >= batch.length) {
      await endSession();
    } else {
      setIdx(idx + 1);
      setReveal(false);
      setTyped("");
    }
  }

  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Practice</CardTitle>
        <CardDescription>Pick a deck and a mode; we’ll pull due cards and track your progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!running ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={deckId ? String(deckId) : ""} onValueChange={(v)=>setDeckId(Number(v))}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Deck" /></SelectTrigger>
              <SelectContent>
                {decks.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={mode} onValueChange={(v)=>setMode(v as Mode)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flip">Flip</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="typing">Typing</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" className="w-20" value={limit} onChange={(e)=>setLimit(Math.max(5, Math.min(50, Number(e.target.value)||15)))} />
            <Button onClick={begin}>Start</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Card {Math.min(idx+1, batch.length)} / {batch.length}</div>
              <div className="text-sm">Correct: {correct}</div>
            </div>
            <Progress value={pct} />
            {current ? (
              <div className="rounded-md border p-4 space-y-3">
                <div className="text-base font-medium">{current.front}</div>

                {mode === "flip" && (
                  <>
                    {reveal ? <div className="whitespace-pre-wrap">{current.back}</div> : null}
                    {!reveal ? (
                      <div className="flex gap-2">
                        <Button onClick={()=>setReveal(true)}>Show</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={()=>mark(true)}>I was right</Button>
                        <Button variant="secondary" onClick={()=>mark(false)}>I was wrong</Button>
                      </div>
                    )}
                  </>
                )}

                {mode === "true_false" && (
                  <>
                    <div className="text-sm text-muted-foreground">Evaluate if the statement is true based on your memory of the answer.</div>
                    <div className="flex gap-2">
                      <Button onClick={()=>mark(true)}>True</Button>
                      <Button variant="secondary" onClick={()=>mark(false)}>False</Button>
                    </div>
                    <details className="text-sm text-muted-foreground">
                      <summary>Show answer</summary>
                      <div className="mt-2 whitespace-pre-wrap">{current.back}</div>
                    </details>
                  </>
                )}

                {mode === "typing" && (
                  <>
                    <Input placeholder="Type your answer…" value={typed} onChange={(e)=>setTyped(e.target.value)} onKeyDown={(e)=>{ if (e.key==="Enter") {
                      const isCorrect = normalize(typed) === normalize(current.back);
                      mark(isCorrect);
                    }}} />
                    <div className="flex gap-2">
                      <Button onClick={() => mark(normalize(typed) === normalize(current.back))}>
                        Submit
                      </Button>
                      <Button variant="secondary" onClick={()=>mark(false)}>I don’t know</Button>
                    </div>
                    <details className="text-sm text-muted-foreground">
                      <summary>Show answer</summary>
                      <div className="mt-2 whitespace-pre-wrap">{current.back}</div>
                    </details>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No cards.</div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={endSession}>End session</Button>
            </div>
          </>
        )}
      </CardContent>
    </UiCard>
  );
}
