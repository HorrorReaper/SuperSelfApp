"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { MUSCLES, EQUIPMENT, DIFFICULTIES} from "@/lib/hubs/fitness/exercises";
import { supabase } from "@/lib/supabase";
import { ExerciseCatalogItem } from "@/lib/types";

export function ExercisesCatalog() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExerciseCatalogItem[]>([]);

  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string>("");
  const [equip, setEquip] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  async function fetchCatalog() {
    setLoading(true);
    let query = supabase
      .from("exercises_catalog")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

      if (q) query = query.ilike("name", `%${q}%`);
      if (muscle && muscle !== "all") query = query.contains("muscle_groups", [muscle]);
      if (equip && equip !== "all") query = query.contains("equipment", [equip]);
      if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load catalog", { description: error.message });
      setItems([]);
    } else {
      setItems(data as ExerciseCatalogItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, muscle, equip, difficulty]);

  async function addToLibrary(item: ExerciseCatalogItem) {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      toast.error("Please sign in to add exercises");
      return;
    }
    const { error } = await supabase
      .from("exercises")
      .insert({
        user_id: user.id,
        catalog_id: item.id,
        name: item.name,
        image_url: item.image_url ?? null,
      });
    if (error) {
      toast.error("Could not add to library", { description: error.message });
    } else {
      toast.success(`Added "${item.name}" to your library`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={muscle} onValueChange={setMuscle}>
          <SelectTrigger><SelectValue placeholder="Muscle group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All muscles</SelectItem>
            {MUSCLES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={equip} onValueChange={setEquip}>
          <SelectTrigger><SelectValue placeholder="Equipment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All equipment</SelectItem>
            {EQUIPMENT.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading catalog…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No exercises match your filters.</div>
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
                ) : (
                  <div className="w-full h-40 rounded-md bg-muted" />
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {it.muscle_groups.join(" • ")}
                </div>
                {it.description && (
                  <p className="mt-2 text-sm line-clamp-3">{it.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="secondary" onClick={() => toast.info(it.name, { description: (it.cues?.join(" · ")) || "No cues" })}>
                  Details
                </Button>
                <Button onClick={() => addToLibrary(it)}>Add to My Library</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
