"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { computeTargets, lbsToKg, inchesToCm } from "@/lib/hubs/fitness/target";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/dist/client/components/navigation";

type UnitPreference = "metric" | "imperial";

export default function FitnessSetupPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [unit, setUnit] = useState<UnitPreference>("metric");

  // Inputs
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>(""); // imperial
  const [weightKg, setWeightKg] = useState<string>("");
  const [weightLbs, setWeightLbs] = useState<string>(""); // imperial
  const [ageYears, setAgeYears] = useState<string>("");
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active" | "very_active">("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");

  // Load existing if present, so users can tweak
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("Please sign in to continue.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("height_cm, weight_kg, age_years, sex, activity_level, goal, unit_preference, macro_targets, calorie_target, fitness_setup_completed")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        if (data.unit_preference) setUnit(data.unit_preference);
        if (data.height_cm) {
          setHeightCm(String(data.height_cm));
          setHeightIn(String(Math.round(data.height_cm / 2.54))); // convenience
        }
        if (data.weight_kg) {
          setWeightKg(String(data.weight_kg));
          setWeightLbs(String(Math.round(Number(data.weight_kg) / 0.45359237)));
        }
        if (data.age_years) setAgeYears(String(data.age_years));
        if (data.sex) setSex(data.sex);
        if (data.activity_level) setActivity(data.activity_level);
        if (data.goal) setGoal(data.goal);
      }
      setLoading(false);
    })();
  }, [supabase]);

  function parseNum(s: string) {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  const normalized = useMemo(() => {
    const hCm = unit === "metric"
      ? parseNum(heightCm)
      : inchesToCm(parseNum(heightIn));
    const wKg = unit === "metric"
      ? parseNum(weightKg)
      : lbsToKg(parseNum(weightLbs));
    const age = parseNum(ageYears);

    return {
      heightCm: hCm,
      weightKg: wKg,
      ageYears: age,
    };
  }, [unit, heightCm, heightIn, weightKg, weightLbs, ageYears]);

  const canCompute =
    Number.isFinite(normalized.heightCm) && normalized.heightCm > 0 &&
    Number.isFinite(normalized.weightKg) && normalized.weightKg > 0 &&
    Number.isFinite(normalized.ageYears) && normalized.ageYears >= 12;

  const targets = useMemo(() => {
    if (!canCompute) return null;
    return computeTargets({
      heightCm: normalized.heightCm,
      weightKg: normalized.weightKg,
      ageYears: normalized.ageYears,
      sex,
      activityLevel: activity,
      goal,
    });
  }, [normalized, sex, activity, goal, canCompute]);

  async function handleSave() {
    if (!canCompute || !targets) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in.");
      setSaving(false);
      return;
    }

    const updatePayload: any = {
      unit_preference: unit,
      height_cm: Math.round(normalized.heightCm),
      weight_kg: Number(normalized.weightKg.toFixed(2)),
      age_years: Math.round(normalized.ageYears),
      sex,
      activity_level: activity,
      goal,
      calorie_target: targets.calories,
      macro_targets: {
        calories: targets.calories,
        protein: targets.protein,
        fat: targets.fat,
        carbs: targets.carbs,
      },
      fitness_setup_completed: true,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save", { description: error.message });
    } else {
      toast.success("Setup complete! Targets saved.");
    }
    setSaving(false);
    if (!error && step === 4) {
      redirect("/hubs/fitness");
    }
}

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fitness Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              {/* Step 0: Units */}
              {step === 0 && (
                <section className="space-y-4">
                  <Label className="block">Units</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={unit === "metric" ? "default" : "secondary"}
                      onClick={() => setUnit("metric")}
                    >
                      Metric (cm, kg)
                    </Button>
                    <Button
                      variant={unit === "imperial" ? "default" : "secondary"}
                      onClick={() => setUnit("imperial")}
                    >
                      Imperial (in, lbs)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can change this later in Settings.
                  </p>
                </section>
              )}

              {/* Step 1: Basics */}
              {step === 1 && (
                <section className="grid grid-cols-2 gap-4">
                  {unit === "metric" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="heightCm">Height (cm)</Label>
                        <Input id="heightCm" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min={100} max={250} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightKg">Weight (kg)</Label>
                        <Input id="weightKg" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min={30} max={300} step="0.1" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="heightIn">Height (in)</Label>
                        <Input id="heightIn" type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} min={40} max={100} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightLbs">Weight (lbs)</Label>
                        <Input id="weightLbs" type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} min={70} max={700} step="0.1" />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="ageYears">Age (years)</Label>
                    <Input id="ageYears" type="number" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} min={12} max={100} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex</Label>
                    <Select value={sex} onValueChange={(v) => setSex(v as any)}>
                      <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>
              )}

              {/* Step 2: Activity */}
              {step === 2 && (
                <section className="space-y-3">
                  <Label>Activity Level</Label>
                  <Select value={activity} onValueChange={(v) => setActivity(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (1–3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3–5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6–7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very active (physical job/athlete)</SelectItem>
                    </SelectContent>
                  </Select>
                </section>
              )}

              {/* Step 3: Goal */}
              {step === 3 && (
                <section className="space-y-3">
                  <Label>Goal</Label>
                  <Select value={goal} onValueChange={(v) => setGoal(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Fat loss (moderate deficit)</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain">Muscle gain (moderate surplus)</SelectItem>
                    </SelectContent>
                  </Select>
                </section>
              )}

              {/* Step 4: Results */}
              {step === 4 && (
                <section className="space-y-4">
                  {!targets ? (
                    <p className="text-sm text-muted-foreground">Fill previous steps to see results.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Daily Calories</div>
                        <div className="text-2xl font-semibold">{targets.calories} kcal</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Protein</div>
                        <div className="text-2xl font-semibold">{targets.protein} g</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Fat</div>
                        <div className="text-2xl font-semibold">{targets.fat} g</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Carbs</div>
                        <div className="text-2xl font-semibold">{targets.carbs} g</div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    These are general guidelines, not medical advice. You can fine-tune macros later in the Fitness Hub.
                  </p>
                </section>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}>Back</Button>
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))} disabled={loading || (step < 4 && !canCompute && step >= 1)}>
              {step < 4 ? "Next" : "Review"}
            </Button>
          </div>
          <Button onClick={handleSave} disabled={saving || loading || !targets}>
            {saving ? "Saving…" : "Save & Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
