// components/fitness/nutrition-tracker.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addMeal, listMeals, totals} from "@/lib/hubs/fitness/nutrition";
import { Progress } from "@/components/ui/progress";
import { Meal } from "@/lib/types";

export function NutritionTracker() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("Meal");
  const [cal, setCal] = useState<string>("");
  const [p, setP] = useState<string>("");
  const [c, setC] = useState<string>("");
  const [f, setF] = useState<string>("");

  // Targets (client-configurable later; simple defaults)
  const target = { calories: 2200, protein_g: 150, carbs_g: 220, fat_g: 70 };

  async function refresh() {
    try { setMeals(await listMeals()); } catch {}
  }
  useEffect(() => { refresh(); }, []);

  async function add() {
    const payload = {
      name: name.trim() || null,
      calories: Number(cal || 0),
      protein_g: Number(p || 0),
      carbs_g: Number(c || 0),
      fat_g: Number(f || 0),
    };
    try {
      await addMeal(payload);
      setName("Meal"); setCal(""); setP(""); setC(""); setF("");
      refresh();
    } catch (e: any) {
      toast.error("Could not add meal", { description: e?.message });
    }
  }

  const sum = useMemo(() => totals(meals), [meals]);

  function bar(val: number, tgt: number) {
    return Math.round(Math.min(100, (val / (tgt || 1)) * 100));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Add meal</div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Calories" value={cal} onChange={(e)=>setCal(e.target.value)} />
            <Input placeholder="Protein (g)" value={p} onChange={(e)=>setP(e.target.value)} />
           <Input placeholder="Carbs (g)" value={c} onChange={(e)=>setC(e.target.value)} />
            <Input placeholder="Fat (g)" value={f} onChange={(e)=>setF(e.target.value)} />
            <Button onClick={add}>Add</Button>
          </div>
          <div className="text-xs text-muted-foreground">Tip: Paste macros from your tracker and sum totals here.</div>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Today’s totals</div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm"><span>Calories</span><span>{sum.calories}/{target.calories}</span></div>
              <Progress value={bar(sum.calories, target.calories)} />
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Protein</span><span>{Math.round(sum.protein_g)}/{target.protein_g} g</span></div>
              <Progress value={bar(sum.protein_g, target.protein_g)} />
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Carbs</span><span>{Math.round(sum.carbs_g)}/{target.carbs_g} g</span></div>
              <Progress value={bar(sum.carbs_g, target.carbs_g)} />
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Fat</span><span>{Math.round(sum.fat_g)}/{target.fat_g} g</span></div>
              <Progress value={bar(sum.fat_g, target.fat_g)} />
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm font-medium mb-2">Meals</div>
          <ul className="space-y-2">
            {meals.map(m => (
              <li key={m.id} className="rounded-md border p-2 text-sm">
                <div className="flex justify-between">
                  <div className="font-medium">{m.name ?? "Meal"}</div>
                  <div>{m.calories} kcal</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  P {Math.round(Number(m.protein_g || 0))} g • C {Math.round(Number(m.carbs_g || 0))} g • F {Math.round(Number(m.fat_g || 0))} g
                </div>
                {m.notes ? <div className="mt-1 text-xs">{m.notes}</div> : null}
              </li>
            ))}
            {!meals.length ? <div className="text-sm text-muted-foreground">No meals yet.</div> : null}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
