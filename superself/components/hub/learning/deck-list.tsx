// components/learning/decks-list.tsx
"use client";
import { useEffect, useState } from "react";
import { listDecks, createDeck, deleteDeck} from "@/lib/hubs/learning/flashcards";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Deck } from "@/lib/types";

export function DecksList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    try { setDecks(await listDecks()); } catch {}
  }
  useEffect(() => { refresh(); }, []);

  async function addDeck() {
    const t = newTitle.trim();
    if (!t) return;
    setCreating(true);
    try {
      await createDeck({ title: t });
      setNewTitle("");
      refresh();
    } catch (e: any) {
      toast.error("Could not create deck", { description: e?.message });
    } finally { setCreating(false); }
  }

  async function removeDeck(id: number) {
    if (!confirm("Delete this deck and its cards?")) return;
    try { await deleteDeck(id); refresh(); } catch (e: any) {
      toast.error("Could not delete deck", { description: e?.message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="New deck title…" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} onKeyDown={(e)=> e.key==="Enter" && addDeck()} />
          <Button onClick={addDeck} disabled={creating}>Create</Button>
        </div>
        <ul className="space-y-2">
          {decks.map(d => (
            <li key={d.id} className="flex items-center justify-between rounded-md border p-3">
              <Link href={`/hubs/learning/decks/${d.id}`} className="font-medium">{d.title}</Link>
              <Button variant="ghost" size="sm" onClick={()=>removeDeck(d.id)}>Delete</Button>
            </li>
          ))}
          {!decks.length ? <div className="text-sm text-muted-foreground">No decks yet. Create one to get started.</div> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
