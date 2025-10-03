"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { UserExercise } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function UserExercisesList({ onSelect }: { onSelect?: (ex: UserExercise) => void }) {
  const [items, setItems] = useState<UserExercise[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchMine() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let query = supabase
      .from("exercises")
      .select("id,user_id,catalog_id,name,notes,image_url")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load your exercises", { description: error.message });
      setItems([]);
    } else {
      setItems(data as UserExercise[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function remove(id: string) {
    const { error } = await supabase.from("exercises").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      toast.success("Removed from your library");
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Search your exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No exercises yet. Add from the catalog.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <Card key={it.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{it.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {it.image_url ? (
                  <div className="relative w-full h-40 rounded-md overflow-hidden bg-muted">
                    <Image src={it.image_url} alt={it.name} fill className="object-cover" />
                  </div>
                ) : <div className="w-full h-40 rounded-md bg-muted" />}
              </CardContent>
              <CardFooter className="flex gap-2">
                {onSelect && (
                  <Button variant="secondary" onClick={() => onSelect(it)}>Use</Button>
                )}
                <Button variant="destructive" onClick={() => remove(it.id)}>Remove</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
