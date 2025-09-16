/*"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { computeWeekData, generateSummary } from "@/lib/weekly-retro";
import { loadState, saveState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekIndex: number; // 1..4
  targetMinutesPerDay: number;
};

export function WeeklyRetroModal({ open, onOpenChange, weekIndex, targetMinutesPerDay }: Props) {
  const [summary, setSummary] = React.useState<{ text: string; suggestion: string } | null>(null);
  const [answers, setAnswers] = React.useState({
    worked: "",
    blockers: "",
    tweak: "",
  });

  React.useEffect(() => {
    if (!open) return;
    const s = loadState<ChallengeState>();
    if (!s) return;
    const metrics = computeWeekData(s, weekIndex);
    const { summaryText, suggestion } = generateSummary(metrics, targetMinutesPerDay);
    setSummary({ text: summaryText, suggestion });
    // Load previous answers if any
    const key = retroKey(weekIndex);
    const existing = (s as any)[key] as typeof answers | undefined;
    if (existing) {
      setAnswers(existing);
    }
  }, [open, weekIndex, targetMinutesPerDay]);

  function retroKey(idx: number) {
    return `retro_week_${idx}`;
  }

  function handleSave() {
    const s = loadState<ChallengeState>();
    if (!s) return;
    (s as any)[retroKey(weekIndex)] = answers;
    saveState(s);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Weekly Retro</DialogTitle>
          <DialogDescription>Reflect, learn, and pick one tweak for next week.</DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Summary:</strong> {summary.text}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Suggestion:</strong> {summary.suggestion}
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">1) What worked this week?</label>
              <Textarea
                value={answers.worked}
                onChange={(e) => setAnswers((a) => ({ ...a, worked: e.target.value }))}
                placeholder="e.g., Morning sessions felt easier; 10-min starts helped"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">2) What got in the way?</label>
              <Textarea
                value={answers.blockers}
                onChange={(e) => setAnswers((a) => ({ ...a, blockers: e.target.value }))}
                placeholder="e.g., Notifications; late nights; unclear next task"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">3) One tiny tweak for next week</label>
              <Textarea
                value={answers.tweak}
                onChange={(e) => setAnswers((a) => ({ ...a, tweak: e.target.value }))}
                placeholder="e.g., Set DND before session; prep task list at shutdown"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleSave}>Save retro</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Preparing your summary…</div>
        )}
      </DialogContent>
    </Dialog>
  );
}*/
// components/.../weekly-retro-modal.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { computeWeekData, generateSummary } from "@/lib/weekly-retro";
import { loadState, saveState } from "@/lib/local";
import type { ChallengeState } from "@/lib/types";
import { toast } from "sonner";                          // NEW
import { awardXpServer } from "@/lib/xp-server";         // NEW
import { insertActivity } from "@/lib/social";           // NEW
import { supabase } from "@/lib/supabase";    // NEW (to get user id once)

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekIndex: number; // 1..4 (or more if you extend)
  targetMinutesPerDay: number;
};

export function WeeklyRetroModal({ open, onOpenChange, weekIndex, targetMinutesPerDay }: Props) {
  const [summary, setSummary] = React.useState<{ text: string; suggestion: string } | null>(null);
  const [answers, setAnswers] = React.useState({ worked: "", blockers: "", tweak: "" });
  const [saving, setSaving] = React.useState(false);     // NEW

  React.useEffect(() => {
    if (!open) return;
    const s = loadState<ChallengeState>();
    if (!s) return;
    const metrics = computeWeekData(s, weekIndex);
    const { summaryText, suggestion } = generateSummary(metrics, targetMinutesPerDay);
    setSummary({ text: summaryText, suggestion });
    // Load previous answers if any
    const key = retroKey(weekIndex);
    const existing = (s as any)[key] as typeof answers | undefined;
    if (existing) setAnswers(existing);
  }, [open, weekIndex, targetMinutesPerDay]);

  function retroKey(idx: number) {
    return `retro_week_${idx}`;
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      // 1) Persist answers locally
      const s = loadState<ChallengeState>();
      if (!s) return;
      (s as any)[retroKey(weekIndex)] = answers;
      saveState(s);

      // 2) Award XP on server (idempotent by (user_id, kind, day))
      const XP = 20; // adjust if you like
      const { error } = await awardXpServer("weekly_retro", weekIndex, XP);
      if (error && !/duplicate key|unique/i.test(error.message)) {
        toast.error("Retro saved, but XP sync failed", { description: error.message });
      } else {
        toast.success("Weekly retro saved", { description: `+${XP} XP for reflecting` });
      }

      // 3) Post activity (best-effort)
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (uid) {
        insertActivity({ actor_id: uid, type: "weekly_retro", day: weekIndex, xp: XP, message: null })
          .catch(() => {});
      }

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Weekly Retro</DialogTitle>
          <DialogDescription>Reflect, learn, and pick one tweak for next week.</DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Summary:</strong> {summary.text}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Suggestion:</strong> {summary.suggestion}
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">1) What worked this week?</label>
              <Textarea value={answers.worked} onChange={(e) => setAnswers((a) => ({ ...a, worked: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">2) What got in the way?</label>
              <Textarea value={answers.blockers} onChange={(e) => setAnswers((a) => ({ ...a, blockers: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">3) One tiny tweak for next week</label>
              <Textarea value={answers.tweak} onChange={(e) => setAnswers((a) => ({ ...a, tweak: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save retro"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Preparing your summary…</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

