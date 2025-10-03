// components/hub/hub-tasks.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addTask, deleteTask, listTasks, setTaskFlags, toggleTaskCompleted } from "@/lib/hubs/productivity/tasks";
import { awardTaskCompleteXP } from "@/lib/xp-server"; // see helper above
import { loadState } from "@/lib/local";
import type { ChallengeState, Task } from "@/lib/types";

const XP_ESSENTIAL = 10;
const XP_FROG = 15;

export function HubTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const todayDay = (loadState<ChallengeState>()?.todayDay) ?? null;

  async function refresh() {
    try { setTasks(await listTasks()); } catch {}
  }
  useEffect(() => { refresh(); }, []);

  async function add(essential=false, frog=false) {
    const t = text.trim();
    if (!t) return;
    setAdding(true);
    try {
      await addTask({ text: t, essential, frog });
      setText("");
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Could not add task", { description: msg });
    } finally { setAdding(false); }
  }

  async function toggleDone(t: Task) {
    const newDone = !t.completed;
    try {
      await toggleTaskCompleted(t.id, newDone);
      if (newDone) {
        const xp = t.frog ? XP_FROG : (t.essential ? XP_ESSENTIAL : 0);
        if (xp > 0) {
          const { error } = await awardTaskCompleteXP(xp, todayDay);
          if (!error || /duplicate key|unique/i.test(error.message)) {
            toast.success(`+${xp} XP`, { description: t.frog ? "Frog task completed" : "Essential task completed" });
          }
        }
      }
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to update", { description: msg });
    }
  }

  async function setFrog(t: Task) {
    try {
      await setTaskFlags(t.id, { frog: !t.frog, essential: t.essential }); // trigger enforces single frog
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to set frog", { description: msg });
    }
  }
  async function setEssential(t: Task) {
    try {
      await setTaskFlags(t.id, { essential: !t.essential });
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to set essential", { description: msg });
    }
  }
  async function remove(t: Task) {
    try { await deleteTask(t.id); refresh(); } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to delete", { description: msg });
    }
  }

  const frog = useMemo(() => tasks.find(t => t.frog), [tasks]);
  const essentials = useMemo(() => tasks.filter(t => t.essential && !t.completed && !t.frog), [tasks]);
  const rest = useMemo(() => tasks.filter(t => !t.essential && !t.frog), [tasks]);

  function Row({ t }: { t: Task }) {
    return (
      <li className="flex items-center gap-2">
        <Checkbox checked={t.completed} onCheckedChange={() => toggleDone(t)} />
        <span className={`flex-1 text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
        {t.frog ? <Badge variant="destructive">Frog</Badge> : null}
        {t.essential && !t.frog ? <Badge>Essential</Badge> : null}
        <Button size="sm" variant="ghost" onClick={() => setFrog(t)}>{t.frog ? "Unmark Frog" : "Make Frog"}</Button>
        {!t.frog && <Button size="sm" variant="ghost" onClick={() => setEssential(t)}>{t.essential ? "Unmark Essential" : "Make Essential"}</Button>}
        <Button size="icon" variant="ghost" onClick={() => remove(t)} aria-label="Delete">✕</Button>
      </li>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={(e)=> e.key==="Enter" && add()}
          />
          <Button onClick={()=>add()} disabled={adding}>Add</Button>
          <Button variant="secondary" onClick={()=>add(true,false)} disabled={adding}>Add Essential</Button>
          <Button variant="secondary" onClick={()=>add(false,true)} disabled={adding}>Add Frog</Button>
        </div>

        {frog ? (
          <div className="rounded-md border p-3">
            <div className="text-sm font-medium mb-2">Eat the Frog (do this first)</div>
            <ul className="space-y-2">
              <Row t={frog} />
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No Frog set yet — pick your toughest, most impactful task and mark it Frog.</div>
        )}

        <div className="rounded-md border p-3">
          <div className="text-sm font-medium mb-2">Essential tasks</div>
          <ul className="space-y-2">
            {essentials.length ? essentials.map(t => <Row key={t.id} t={t} />) :
              <li className="text-xs text-muted-foreground">Add 1–3 essentials for today.</li>}
          </ul>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm font-medium mb-2">Other tasks</div>
          <ul className="space-y-2">
            {rest.length ? rest.map(t => <Row key={t.id} t={t} />) :
              <li className="text-xs text-muted-foreground">Inbox zero vibes here.</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
