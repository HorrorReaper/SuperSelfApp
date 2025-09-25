"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type MacroTargets = {
  calories?: number | null;
  protein?: number | null; // grams
  carbs?: number | null;   // grams
  fat?: number | null;     // grams
};

function sanitizeNumber(value: string): number | null {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (n < 0) return 0;
  return Math.round(n);
}

export function MacroTargetsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function fetchTargets() {
      setLoading(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        toast.error("Auth error", { description: userErr.message });
        setLoading(false);
        return;
      }
      if (!user) {
        toast("Please sign in to edit macro targets.");
        setLoading(false);
        return;
      }

      // Adjust table/column names as needed:
      // - If your table is named "profile" (singular), change to .from("profile")
      // - If your key column is "user_id" not "id", change the eq() filter.
      const { data, error } = await supabase
        .from("profiles")
        .select("macro_targets")
        .eq("id", user.id)
        .single();

      if (error) {
        toast.error("Failed to load macro targets", { description: error.message });
      } else {
        const mt = (data?.macro_targets ?? {}) as MacroTargets;
        setCalories(mt.calories != null ? String(mt.calories) : "");
        setProtein(mt.protein != null ? String(mt.protein) : "");
        setCarbs(mt.carbs != null ? String(mt.carbs) : "");
        setFat(mt.fat != null ? String(mt.fat) : "");
      }
      if (active) setLoading(false);
    }

    fetchTargets();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    const targets: MacroTargets = {
      calories: sanitizeNumber(calories),
      protein: sanitizeNumber(protein),
      carbs: sanitizeNumber(carbs),
      fat: sanitizeNumber(fat),
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast("Please sign in to save.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles") // adjust if your table is "profile"
      .update({ macro_targets: targets })
      .eq("id", user.id); // adjust to .eq("user_id", user.id) if your key is user_id

    if (error) {
      toast.error("Save failed", { description: error.message });
    } else {
      toast.success("Macro targets saved");
    }
    setSaving(false);
  }

  async function handleClear() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast("Please sign in to save.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ macro_targets: {} })
      .eq("id", user.id);

    if (error) {
      toast.error("Clear failed", { description: error.message });
    } else {
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      toast.success("Targets cleared");
    }
    setSaving(false);
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Macro Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading targets…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories (kcal/day)</Label>
                <Input
                  id="calories"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="e.g., 2200"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g/day)</Label>
                <Input
                  id="protein"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="e.g., 150"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g/day)</Label>
                <Input
                  id="carbs"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="e.g., 240"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g/day)</Label>
                <Input
                  id="fat"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="e.g., 70"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: You can leave any field blank to keep it unset.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving ? "Saving…" : "Save Targets"}
        </Button>
        <Button variant="secondary" onClick={handleClear} disabled={loading || saving}>
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}
