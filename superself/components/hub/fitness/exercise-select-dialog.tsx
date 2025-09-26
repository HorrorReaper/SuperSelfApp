"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Exercise } from "@/lib/types";
import { addExercise } from "@/lib/hubs/fitness/workout";
import { supabase } from "@/lib/supabase";

type CatalogItem = {
  id: string;
  name: string;
  muscle_groups: string[];
  image_url?: string | null;
};

export function ExerciseSelectDialog({
  exercises,
  onPick,
}: {
  exercises: Exercise[];
  onPick: (ex: Exercise) => void;
}) {
  const [open, setOpen] = useState(false);

  // Library search
  const [libQuery, setLibQuery] = useState("");

  const filteredLibrary = useMemo(() => {
    const q = libQuery.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [exercises, libQuery]);

  // Catalog search
  const [catQuery, setCatQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loadingCat, setLoadingCat] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchCatalog() {
      setLoadingCat(true);
      let query = supabase
        .from("exercises_catalog")
        .select("id,name,muscle_groups,image_url")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (catQuery.trim()) query = query.ilike("name", `%${catQuery.trim()}%`);

      const { data, error } = await query;
      if (active) {
        if (error) {
          setCatalog([]);
        } else {
          setCatalog((data ?? []) as CatalogItem[]);
        }
        setLoadingCat(false);
      }
    }
    fetchCatalog();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catQuery, open]);

  async function addFromCatalog(item: CatalogItem) {
    try {
      // Use your existing abstraction: addExercise(name) returns Exercise
      const ex = await addExercise(item.name);
      toast.success(`Added "${item.name}" to your library`);
      onPick(ex);
      setOpen(false);
    } catch (e: any) {
      toast.error("Could not add exercise", { description: e?.message });
    }
  }

  function useLibraryExercise(ex: Exercise) {
    onPick(ex);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Choose exercise</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select an exercise</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Your Library */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search your exercises…"
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-[360px] overflow-auto">
                  {filteredLibrary.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No matches in your library.</div>
                  ) : (
                    filteredLibrary.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="text-sm">{ex.name}</div>
                        <Button size="sm" variant="secondary" onClick={() => useLibraryExercise(ex)}>
                          Use
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Tip: Add more from the catalog on the right.
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right: Catalog */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exercise Catalog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search the catalog…"
                  value={catQuery}
                  onChange={(e) => setCatQuery(e.target.value)}
                />
                {loadingCat ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-auto">
                    {catalog.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No catalog results.</div>
                    ) : (
                      catalog.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.muscle_groups?.join(" • ")}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => addFromCatalog(item)}>
                            Add to Library
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
