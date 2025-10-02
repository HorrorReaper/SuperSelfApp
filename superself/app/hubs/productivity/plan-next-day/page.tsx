"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { tomorrowISO } from "@/lib/convert";
import { isValidTime, toMinutes } from "@/lib/validators";
import { FullDayCalendar } from "@/components/hub/productivity/full-day-calendar";

type Task = { id: number; text: string; essential?: boolean; frog?: boolean; completed_at?: string | null };

// tomorrowISO imported from lib/convert

export default function PlanNextDayPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planDate, setPlanDate] = useState<string>(tomorrowISO());

  // plan state
  const [frogId, setFrogId] = useState<string>("");
  const [essentialIds, setEssentialIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<{ start: string; end: string; title: string; kind: string; task_id?: number | null }[]>([]);

  const [checklist, setChecklist] = useState<{ label: string; done: boolean }[]>([]);
  const [notes, setNotes] = useState<string>("");

  // tasks from server
  const [tasks, setTasks] = useState<Task[]>([]);

  const displayBlocks = blocks.map(b => ({
    ...b,
    title: b.task_id
      ? `${b.title} • ${tasks.find(t => t.id === b.task_id)?.text ?? "Task"}`
      : b.title,
  }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setLoading(false); return; }

      // fetch or create plan
      const { data: plan } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_date", planDate)
        .maybeSingle();

      if (plan) {
        setPlanId(plan.id);
        setFrogId(plan.frog_task_id ? String(plan.frog_task_id) : "");
        setEssentialIds((plan.essential_task_ids ?? []).map(String));
        setBlocks(plan.blocks ?? []);
        setChecklist(plan.checklist ?? []);
        setNotes(plan.notes ?? "");
      } else {
        const { data: created, error } = await supabase
          .from("day_plans")
          .insert({ user_id: user.id, plan_date: planDate, essential_task_ids: [], blocks: [], checklist: [], status: "planned" })
          .select("*").single();
        if (error) toast.error("Could not create plan", { description: error.message });
        setPlanId(created?.id ?? null);
      }

      // pull tasks (adjust table/columns to your schema)
      const { data: t } = await supabase
        .from("tasks")
        .select("id,text,essential,frog,completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setTasks((t ?? []) as Task[]);
      setLoading(false);
    })();
  }, [planDate, supabase]);

  function addBlock() {
    setBlocks([...blocks, { start: "09:00", end: "10:00", title: "Focus Block", kind: "focus", task_id: null }]);
  }
  function updateBlock(i: number, patch: Partial<typeof blocks[number]>) {
    setBlocks(blocks.map((b, idx) => idx === i ? { ...b, ...patch } : b));
  }
  function removeBlock(i: number) {
    setBlocks(blocks.filter((_, idx) => idx !== i));
  }

  // validators moved to lib/validators.ts

  function validateBlocks() {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!isValidTime(b.start) || !isValidTime(b.end)) {
        toast.error("Invalid time format", { description: `Block #${i + 1} has invalid start or end time. Use HH:MM.` });
        return false;
      }
      const s = toMinutes(b.start);
      const e = toMinutes(b.end);
      if (s >= e) {
        toast.error("Invalid time range", { description: `Block #${i + 1} start must be before end.` });
        return false;
      }
    }
    return true;
  }

  function addChecklistItem() {
    setChecklist([...checklist, { label: "Prep tasks", done: false }]);
  }
  function updateChecklist(i: number, patch: Partial<{label:string;done:boolean}>) {
    setChecklist(checklist.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }
  function removeChecklist(i: number) {
    setChecklist(checklist.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!planId) return;
    if (!validateBlocks()) return;
    setSaving(true);
    const payload = {
      plan_date: planDate,
      frog_task_id: frogId ? Number(frogId) : null,
      essential_task_ids: essentialIds.map((x) => Number(x)).slice(0, 3),
      blocks,
      checklist,
      notes,
      status: "planned",
    };
    const { error } = await supabase.from("day_plans").update(payload).eq("id", planId);
    if (error) toast.error("Save failed", { description: error.message });
    else toast.success("Plan saved");
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Your Next Day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              {/* Date selector */}
              <div className="flex items-center gap-2">
                <Input type="date" value={planDate} onChange={(e)=>setPlanDate(e.target.value)} className="w-[200px]" />
                <Button variant="secondary" onClick={()=>setPlanDate(tomorrowISO())}>Tomorrow</Button>
              </div>

              {/* Frog */}
              <section className="space-y-2">
                <div className="text-sm font-medium">Eat the Frog</div>
                <Select value={frogId} onValueChange={setFrogId}>
                  <SelectTrigger className="w-[360px]"><SelectValue placeholder="Pick your most important task" /></SelectTrigger>
                  <SelectContent>
                    {tasks.filter(t => Boolean(t.frog)).map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.text}</SelectItem>
                    ))}
                    {/* fallback: allow essentials or any */}
                    {tasks.filter(t => !t.frog).map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.text}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              {/* Essentials */}
              <section className="space-y-2">
                <div className="text-sm font-medium">Top 3 Essentials</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[0,1,2].map(i => (
                    <Select key={i} value={essentialIds[i] ?? ""} onValueChange={(v)=>{
                      const next = [...essentialIds]; next[i] = v; setEssentialIds(next);
                    }}>
                      <SelectTrigger><SelectValue placeholder={`Essential #${i+1}`} /></SelectTrigger>
                      <SelectContent>
                        {tasks.filter(t => Boolean(t.essential)).map(t => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.text}</SelectItem>
                        ))}
                        {tasks.filter(t => !t.essential).map(t => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.text}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              </section>

              {/* Timeboxing blocks */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Schedule Blocks</div>
                  <Button size="sm" onClick={addBlock}>Add Block</Button>
                </div>
                <div className="space-y-2">
                  {blocks.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Add 2–4 focus blocks and key events.</div>
                  ) : blocks.map((b, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                      <Input type="time" className="w-24" value={b.start} onChange={(e)=>updateBlock(i,{start:e.target.value})} placeholder="08:30" />
                      <Input type="time" className="w-24" value={b.end} onChange={(e)=>updateBlock(i,{end:e.target.value})} placeholder="10:00" />
                      <Input className="w-[220px]" value={b.title} onChange={(e)=>updateBlock(i,{title:e.target.value})} placeholder="Deep Work" />
                      <Select value={b.kind} onValueChange={(v)=>updateBlock(i,{kind:v})}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Kind" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="focus">Focus</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="break">Break</SelectItem>
                          <SelectItem value="mobility">Mobility</SelectItem>
                          <SelectItem value="workout">Workout</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {b.kind === "focus" && (
                        <Select
                          value={b.task_id ? String(b.task_id) : ""}
                          onValueChange={(v)=>updateBlock(i,{ task_id: v ? Number(v) : null })}
                        >
                          <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Assign a task to this focus block" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Prefer uncompleted tasks */}
                            {tasks
                              .filter(t => !t.completed_at)
                              .map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                  {t.text}
                                </SelectItem>
                              ))
                            }
                            {/* Fallback: allow completed tasks too */}
                            {tasks
                              .filter(t => t.completed_at)
                              .map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                  ✅ {t.text}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      )}
                      <Button variant="destructive" size="sm" onClick={()=>removeBlock(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-2">
                <div className="text-sm font-medium">Day Timeline (Preview)</div>
                <div className="rounded-lg border">
                  
                  <FullDayCalendar blocks={displayBlocks} />
                </div>
              </section>
              
              {/* Checklist + Notes */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Checklist</div>
                  <Button size="sm" onClick={addChecklistItem}>Add item</Button>
                </div>
                <div className="space-y-2">
                  {checklist.length === 0 ? <div className="text-sm text-muted-foreground">E.g., prep meals, lay out gym clothes, plan commute.</div> :
                    checklist.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input className="flex-1" value={c.label} onChange={(e)=>updateChecklist(i,{label:e.target.value})} />
                        <Button variant="destructive" size="sm" onClick={()=>removeChecklist(i)}>Remove</Button>
                      </div>
                    ))
                  }
                </div>
                <Textarea placeholder="Notes, intent, constraints…" value={notes} onChange={(e)=>setNotes(e.target.value)} />
              </section>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={save} disabled={saving || loading}>{saving ? "Saving…" : "Save Plan"}</Button>
          <Button variant="secondary" onClick={() => toast("Tip", { description: "Blocks of 50–90 minutes work well with short breaks." })}>
            Planning Tips
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
