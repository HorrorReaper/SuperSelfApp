// components/learning/deck-editor.tsx
"use client";
import { useEffect, useState } from "react";
import { listCards, createCard, updateCard, deleteCard} from "@/lib/hubs/learning/flashcards";
import { Card as UiCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/lib/types";

export function DeckEditor({ deckId }: { deckId: number }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [ctype, setCtype] = useState<"basic"|"true_false"|"typing">("basic");
  const [adding, setAdding] = useState(false);

  async function refresh() {
    try { setCards(await listCards(deckId)); } catch {}
  }
  useEffect(() => { refresh(); }, [deckId]);

  async function add() {
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    try {
      await createCard(deckId, { front: front.trim(), back: back.trim(), card_type: ctype });
      setFront(""); setBack("");
      refresh();
    } catch (e: any) {
      toast.error("Could not add card", { description: e?.message });
    } finally { setAdding(false); }
  }

  async function save(c: Card) {
    try { await updateCard(c.id, { front: c.front, back: c.back, card_type: c.card_type }); toast.success("Saved"); }
    catch (e: any) { toast.error("Failed to save", { description: e?.message }); }
  }

  async function remove(id: number) {
    try { await deleteCard(id); refresh(); } catch (e: any) {
      toast.error("Failed to delete", { description: e?.message });
    }
  }

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <Select value={ctype} onValueChange={(v)=>setCtype(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Flip</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="typing">Typing</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={add} disabled={adding}>Add</Button>
          </div>
          <Input placeholder="Front…" value={front} onChange={(e)=>setFront(e.target.value)} />
          <Textarea placeholder="Back (answer)…" value={back} onChange={(e)=>setBack(e.target.value)} />
        </div>

        <ul className="space-y-3">
          {cards.map(c => (
            <li key={c.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={c.card_type} onValueChange={(v)=>{ c.card_type = v as any; setCards([...cards]); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Flip</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="typing">Typing</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={()=>save(c)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={()=>remove(c.id)}>Delete</Button>
              </div>
              <Input value={c.front} onChange={(e)=>{ c.front = e.target.value; setCards([...cards]); }} />
              <Textarea value={c.back} onChange={(e)=>{ c.back = e.target.value; setCards([...cards]); }} />
            </li>
          ))}
          {!cards.length ? <div className="text-sm text-muted-foreground">No cards yet.</div> : null}
        </ul>
      </CardContent>
    </UiCard>
  );
}
