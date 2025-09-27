"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MoodLevel } from "@/lib/types";
import { cn } from "@/lib/utils"; // optional classnames helper, or swap cn(...) with template strings
import { awardForMoodCheckin } from "@/lib/gamification";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getOrCreateTemplate, listFields, saveEntry } from "@/lib/checkins";
import { loadState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { awardXpServer } from "@/lib/xp-server";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (mood: MoodLevel, note?: string) => void;
  defaultMood?: MoodLevel | null;
};

const MOODS: { key: MoodLevel; label: string; emoji: string; color: string }[] = [
  { key: "super",       label: "Super",       emoji: "🤩", color: "bg-emerald-500" },
  { key: "good",        label: "Good",        emoji: "🙂", color: "bg-sky-500" },
  { key: "normal",      label: "Normal",      emoji: "😐", color: "bg-slate-400" },
  { key: "not_really",  label: "Not really",  emoji: "😕", color: "bg-amber-500" },
  { key: "terrible",    label: "Terrible",    emoji: "😣", color: "bg-rose-500" },
];
function FieldInput({ f, value, onChange }: { f: any; value: any; onChange: (v:any)=>void }) {
  if (f.type === "scale_1_5") {
    const v = Number(value ?? 3);
    return (
      <div>
        <div className="flex items-center justify-between">
          <div className="text-sm">{f.label}</div>
          <div className="text-sm">{v}</div>
        </div>
        <Slider value={[v]} min={1} max={5} step={1} onValueChange={(arr)=>onChange(arr[0])} />
        {f.helper ? <div className="text-xs text-muted-foreground mt-1">{f.helper}</div> : null}
      </div>
    );
  }
  if (f.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <Checkbox checked={!!value} onCheckedChange={(v)=>onChange(!!v)} />
        <div className="text-sm">{f.label}</div>
        {f.helper ? <div className="text-xs text-muted-foreground">{f.helper}</div> : null}
      </div>
    );
  }
  if (f.type === "short_text") {
    return (
      <div>
        <div className="text-sm">{f.label}</div>
        <Input value={value ?? ""} onChange={(e)=>onChange(e.target.value)} />
        {f.helper ? <div className="text-xs text-muted-foreground mt-1">{f.helper}</div> : null}
      </div>
    );
  }
  if (f.type === "long_text") {
    return (
      <div>
        <div className="text-sm">{f.label}</div>
        <Textarea value={value ?? ""} onChange={(e)=>onChange(e.target.value)} />
        {f.helper ? <div className="text-xs text-muted-foreground mt-1">{f.helper}</div> : null}
      </div>
    );
  }
  if (f.type === "select_one") {
    const items = f.options?.items ?? [];
    return (
      <div>
        <div className="text-sm">{f.label}</div>
        <Select value={value ?? ""} onValueChange={(v)=>onChange(v)}>
          <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
          <SelectContent>
            {items.map((opt:string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
        {f.helper ? <div className="text-xs text-muted-foreground mt-1">{f.helper}</div> : null}
      </div>
    );
  }
  if (f.type === "select_many") {
    const items = f.options?.items ?? [];
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        <div className="text-sm">{f.label}</div>
        <div className="flex flex-wrap gap-2">
          {items.map((opt:string) => {
            const checked = arr.includes(opt);
            return (
              <Button
                key={opt}
                size="sm"
                variant={checked ? "default" : "secondary"}
                onClick={()=> {
                  const next = checked ? arr.filter((x:string) => x !== opt) : [...arr, opt];
                  onChange(next);
                }}
              >
                {opt}
              </Button>
            );
          })}
        </div>
        {f.helper ? <div className="text-xs text-muted-foreground mt-1">{f.helper}</div> : null}
      </div>
    );
  }
  return null;
}

export function MoodCheckinModal({ open, onOpenChange, onSubmit, defaultMood = null }: Props) {
  const [mood, setMood] = React.useState<MoodLevel | null>(defaultMood);
  const [showJournal, setShowJournal] = React.useState(false);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMood(defaultMood ?? null);
      setShowJournal(false);
      setNote("");
    }
  }, [open, defaultMood]);

  function handleSubmitMoodOnly() {
    if (!mood) return;
    onSubmit(mood, undefined);
    const { gained, levelUp, newLevel } = awardForMoodCheckin(1);
    if (gained > 0) {
      toast.success(`+${gained} XP`, { description: `Mood check-in recorded` });
    }
    if (levelUp) {
      toast(`Level up!`, { description: `You reached level ${newLevel} 🚀`, richColors: true });

    }
    onOpenChange(false);
  }

  function handleSubmitWithJournal() {
    if (!mood) return;
    onSubmit(mood, note.trim() || undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[min(92vw,720px)] sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle>How are you feeling today?</DialogTitle>
          <DialogDescription>Select one. You can add a short journal if you want.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
 
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "rounded-2xl px-2 py-3 text-center transition border",
                    selected
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-neutral-100 dark:bg-neutral-800 border-transparent hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80"
                  )}
                  aria-pressed={selected}
                >
                  <div className="text-2xl leading-none">{m.emoji}</div>
                  <div className="mt-1 text-[11px]">{m.label}</div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Not now
            </Button>
            {!showJournal ? (
              <>
                <Button
                  variant="secondary"
                  disabled={!mood}
                  onClick={handleSubmitMoodOnly}
                  title="Submit just your mood"
                  className="w-full sm:w-auto"
                >
                  Submit mood
                </Button>
                <Button
                  disabled={!mood}
                  onClick={() => setShowJournal(true)}
                  title="Add a short journal"
                  className="w-full sm:w-auto"
                >
                  Journal
                </Button>
              </>
            ) : (
              <Button disabled={!mood} onClick={handleSubmitWithJournal} className="w-full sm:w-auto">
                Submit mood + journal
              </Button>
            )}
          </div>

          {showJournal && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1">
              {/* Render the dynamic journal editor instead of the small textarea */}
              <MoodCheckinDynamic
                onClose={() => {
                  setShowJournal(false);
                }}
                onSaved={() => {
                  // when the dynamic editor finishes saving, call the parent's onSubmit
                  // we don't have a note here (structured fields were saved separately),
                  // so call onSubmit with the mood and undefined note to preserve contract.
                  if (mood) onSubmit(mood, undefined);
                  // close the modal
                  onOpenChange(false);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
// components/.../mood-checkin-modal.tsx (inside your modal)


const XP_MOOD = 10;



export function MoodCheckinDynamic({ onClose, onSaved }: { onClose?: () => void; onSaved?: () => void }) {
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const todayDay = (loadState<ChallengeState>()?.todayDay) ?? null;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getOrCreateTemplate();
      setTemplateId(t.id);
      const fs = await listFields(t.id);
      setFields(fs);
      // prefill defaults
      const initVals: Record<string, any> = {};
      fs.forEach(f => {
        if (f.type === "scale_1_5") initVals[String(f.id)] = 3;
        if (f.type === "boolean") initVals[String(f.id)] = false;
        if (f.type === "select_many") initVals[String(f.id)] = [];
      });
      setValues(initVals);
    })().catch(()=>{});
  }, []);

  function setValue(fid: number, v: any) {
    setValues(prev => ({ ...prev, [String(fid)]: v }));
  }

  async function save() {
    if (!templateId) return;
    // Simple required validation
    const missing = fields.filter(f => f.required && (values[String(f.id)] === undefined || values[String(f.id)] === "" || (Array.isArray(values[String(f.id)]) && !values[String(f.id)].length)));
    if (missing.length) {
      toast.error("Please fill required fields", { description: missing.map(m=>m.label).join(", ") });
      return;
    }

    setSaving(true);
    try {
      await saveEntry(templateId, todayDay, values);
      // Award XP (idempotent via xp_events unique key)
      const { error } = await awardXpServer("mood_checkin", todayDay, 10);
      if (!error || /duplicate key|unique/i.test(error.message)) {
        toast.success("+10 XP", { description: "Mood check‑in saved" });
      } else {
        toast.error("Saved, but XP sync failed", { description: error.message });
      }
      // notify parent that a save completed (so it can e.g. submit mood and close the dialog)
      onSaved?.();
      onClose?.();
    } catch (e: any) {
      toast.error("Failed to save", { description: e?.message });
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.id} className="rounded-md border p-3">
          <FieldInput f={f} value={values[String(f.id)]} onChange={(v)=>setValue(f.id, v)} />
        </div>
      ))}
      {!fields.length ? <div className="text-sm text-muted-foreground">No fields configured. Add questions in Profile → Journal Settings.</div> : null}
      <div className="flex gap-2 pt-2">
        <Button onClick={save} disabled={saving || !fields.length}>Save</Button>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

