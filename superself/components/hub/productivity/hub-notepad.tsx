"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getOrCreateScratchpad, saveScratchpad } from "@/lib/hubs/productivity/notes";

export function HubNotepad() {
  const [title, setTitle] = useState("Scratchpad");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle"|"saving"|"saved">("idle");

  // Debounced autosave
  const saveDebounce = useRef<number | null>(null);
  function scheduleSave() {
    if (saveDebounce.current) window.clearTimeout(saveDebounce.current);
    saveDebounce.current = window.setTimeout(async () => {
      try {
        setSaving("saving");
        await saveScratchpad(content, title);
        setSaving("saved");
        setTimeout(() => setSaving("idle"), 1000);
      } catch (e: any) {
        setSaving("idle");
        toast.error("Failed to save note", { description: e?.message });
      }
    }, 600) as unknown as number;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const note = await getOrCreateScratchpad();
        if (!mounted) return;
        setTitle(note.title ?? "Scratchpad");
        setContent(note.content ?? "");
      } catch (e: any) {
        toast.error("Failed to load notepad", { description: e?.message });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; if (saveDebounce.current) window.clearTimeout(saveDebounce.current); };
  }, []);

  const status = useMemo(() => {
    return saving === "saving" ? "Saving..." : saving === "saved" ? "Saved" : "";
  }, [saving]);

  async function saveNow() {
    try {
      setSaving("saving");
      await saveScratchpad(content, title);
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1000);
      toast.success("Saved");
    } catch (e: any) {
      setSaving("idle");
      toast.error("Failed to save note", { description: e?.message });
    }
  }

  function clearAll() {
    setContent("");
    scheduleSave();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Notepad</CardTitle>
        <CardDescription>Quick scratchpad for ideas, context, and planning. Autosaves.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e)=>{ setTitle(e.target.value); scheduleSave(); }}
            placeholder="Title"
            className="max-w-xs"
            disabled={loading}
          />
          <div className="ml-auto text-xs text-muted-foreground">{status}</div>
        </div>
        <Textarea
          value={content}
          onChange={(e)=>{ setContent(e.target.value); scheduleSave(); }}
          placeholder="Write freely..."
          className="min-h-48"
          disabled={loading}
        />
        <div className="flex items-center gap-2">
          <Button onClick={saveNow} disabled={loading || saving === "saving"}>Save</Button>
          <Button variant="secondary" onClick={clearAll} disabled={loading}>Clear</Button>
        </div>
      </CardContent>
    </Card>
  );
}
