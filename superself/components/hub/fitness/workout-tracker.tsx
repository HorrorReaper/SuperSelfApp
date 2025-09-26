// components/fitness/workout-tracker.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { addExercise, listExercises, startSession, finishSession, addSet, listSessions, listSets} from "@/lib/hubs/fitness/workout";
import { Exercise, WorkoutSession, WorkoutSet } from "@/lib/types";
import { ExerciseSelectDialog } from "./exercise-select-dialog";

export function WorkoutTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [customExercise, setCustomExercise] = useState("");
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");

  async function loadExercises() {
    try { setExercises(await listExercises()); } catch {}
  }
  useEffect(() => { loadExercises(); }, []);

  async function begin() {
    try {
      const s = await startSession();
      setSession(s);
      setSets([]);
      toast("Workout started");
    } catch (e: any) {
      toast.error("Could not start", { description: e?.message });
    }
  }

  async function addNewExercise() {
    const name = newName.trim();
    if (!name) return;
    try {
      const ex = await addExercise(name);
      setExercises([...exercises, ex]);
      setNewName("");
    } catch (e: any) {
      toast.error("Could not add exercise", { description: e?.message });
    }
  }
  function handlePickExercise(ex: Exercise) {
  // ensure it's in local state (in case it was newly added from catalog)
  if (!exercises.find((e) => e.id === ex.id)) {
    setExercises((prev) => [...prev, ex]);
  }
  setSelectedExerciseId(String(ex.id));
  setCustomExercise("");
}

  async function addOneSet() {
    if (!session) { toast.error("Start a session first"); return; }
    const payload = {
      exercise_id:
        selectedExerciseId && selectedExerciseId !== "custom"
          ? Number(selectedExerciseId)
          : null,
      custom_exercise:
        selectedExerciseId === "custom"
          ? (customExercise.trim() || null)
          : null,
      weight: weight ? Number(weight) : null,
      reps: reps ? Number(reps) : null,
      set_index: sets.length + 1,
    };
    try {
      const s = await addSet(session.id, payload);
      setSets([...sets, s]);
      setWeight(""); setReps(""); setCustomExercise("");
    } catch (e: any) {
      toast.error("Could not add set", { description: e?.message });
    }
  }

  async function end() {
    if (!session) return;
    try {
      const updated = await finishSession(session.id);
      setSession(updated);
      toast.success("Workout finished", { description: `Total volume: ${Math.round(updated.total_volume)}` });
    } catch (e: any) {
      toast.error("Could not finish", { description: e?.message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!session ? (
          <div className="flex items-center gap-2">
            <Button onClick={begin}>Start Workout</Button>
            <div className="text-sm text-muted-foreground">Track sets, weight, and reps.</div>
          </div>
        ) : (
          <>
            <div className="rounded-md border p-3 space-y-2">
              <div className="text-sm font-medium">Add set</div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedExerciseId} onValueChange={(v)=>{ setSelectedExerciseId(v); setCustomExercise(""); }}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((ex) => (
                      <SelectItem key={ex.id} value={String(ex.id)}>
                        {ex.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <ExerciseSelectDialog exercises={exercises} onPick={handlePickExercise} />
                {selectedExerciseId === "custom" ? (
                  <Input
                    className="w-[220px]"
                    placeholder="Custom exercise"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                  />
                ) : null}
                <Input className="w-24" placeholder="Weight (kg)" value={weight} onChange={(e)=>setWeight(e.target.value)} />
                <Input className="w-20" placeholder="Reps" value={reps} onChange={(e)=>setReps(e.target.value)} />
                <Button onClick={addOneSet}>Add set</Button>
                <Button variant="secondary" onClick={end}>Finish Workout</Button>
              </div>
            </div>

            <ul className="space-y-2">
              {sets.map(s => (
                <li key={s.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      {s.exercise_id
                        ? exercises.find(e => e.id === s.exercise_id)?.name ?? "Exercise"
                        : s.custom_exercise ?? "Exercise"} • Set {s.set_index}
                    </div>
                    <div className="tabular-nums">
                      {s.weight ?? 0} kg × {s.reps ?? 0} reps
                      <span className="ml-2 text-muted-foreground">vol {Math.round(Number(s.volume ?? 0))}</span>
                    </div>
                  </div>
                </li>
              ))}
              {!sets.length ? <div className="text-sm text-muted-foreground">No sets yet.</div> : null}
            </ul>
          </>
        )}

        {/* Add exercise */}
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Add exercise to library</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Exercise name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
            <Button onClick={addNewExercise} disabled={!newName.trim()}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
