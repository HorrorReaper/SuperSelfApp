// components/user/journal-settings.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getOrCreateTemplate, listFields, createField, updateField, deleteField, reorderFields} from "@/lib/checkins";
import { FieldType, JournalField } from "@/lib/types";

const TYPES: { value: FieldType; label: string }[] = [
  { value: "scale_1_5", label: "Scale (1–5)" },
  { value: "boolean", label: "Yes / No" },
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "select_one", label: "Select one" },
  { value: "select_many", label: "Select many" },
];

export function JournalSettings() {
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [fields, setFields] = useState<JournalField[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FieldType>("short_text");
  const [newOptions, setNewOptions] = useState(""); // comma-separated

  async function load() {
    try {
      const t = await getOrCreateTemplate();
      setTemplateId(t.id);
      const fs = await listFields(t.id);
      setFields(fs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to load journal", { description: msg });
    }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!templateId) return;
    const label = newLabel.trim();
    if (!label) return;
    const options = newType.startsWith("select") ? { items: newOptions.split(",").map(s => s.trim()).filter(Boolean) } : null;
    try {
      const f = await createField(templateId, { label, helper: null, type: newType, required: false, options, order_index: fields.length });
      setFields([...fields, f]);
      setNewLabel(""); setNewOptions("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Could not add field", { description: msg });
    }
  }

  async function saveField(f: JournalField) {
    try {
      const patch = { label: f.label, helper: f.helper, type: f.type, required: f.required, options: f.options };
      await updateField(f.id, patch);
      toast.success("Saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to save", { description: msg });
    }
  }

  async function removeField(id: number) {
  try { await deleteField(id); setFields(fields.filter(x => x.id !== id)); }
  catch (err: unknown) { const msg = err instanceof Error ? err.message : String(err); toast.error("Failed to delete", { description: msg }); }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = fields.findIndex(f => f.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= fields.length) return;
    const arr = [...fields];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setFields(arr);
    try { await reorderFields(templateId!, arr.map(f => f.id)); } catch {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new field */}
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-medium">Add a question</div>
          <Input placeholder="Question label…" value={newLabel} onChange={(e)=>setNewLabel(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={newType} onValueChange={(v)=>setNewType(v as FieldType)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {newType.startsWith("select") ? (
              <Input className="flex-1" placeholder="Options (comma separated)" value={newOptions} onChange={(e)=>setNewOptions(e.target.value)} />
            ) : null}
            <Button onClick={add} disabled={!newLabel.trim()}>Add</Button>
          </div>
        </div>

        {/* Existing fields */}
        <ul className="space-y-3">
          {fields.map(f => (
            <li key={f.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={()=>move(f.id, -1)} disabled={fields[0]?.id===f.id}>↑</Button>
                <Button size="sm" variant="ghost" onClick={()=>move(f.id, +1)} disabled={fields[fields.length-1]?.id===f.id}>↓</Button>
                <Select value={f.type} onValueChange={(v)=>{ f.type = v as FieldType; setFields([...fields]); }}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Switch checked={f.required} onCheckedChange={(v)=>{ f.required = !!v; setFields([...fields]); }} />
                <span className="text-xs text-muted-foreground">Required</span>
                <Button size="sm" className="ml-auto" onClick={()=>saveField(f)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={()=>removeField(f.id)}>Delete</Button>
              </div>
              <Input value={f.label} onChange={(e)=>{ f.label = e.target.value; setFields([...fields]); }} />
              <Input placeholder="Helper (optional)" value={f.helper ?? ""} onChange={(e)=>{ f.helper = e.target.value; setFields([...fields]); }} />
              {f.type.startsWith("select") ? (
                <Textarea
                  placeholder="Options (one per line)"
                  value={(f.options?.items ?? []).join("\n")}
                  onChange={(e)=>{ f.options = { items: e.target.value.split("\n").map(s=>s.trim()).filter(Boolean) }; setFields([...fields]); }}
                />
              ) : null}
            </li>
          ))}
          {!fields.length ? <div className="text-sm text-muted-foreground">No fields yet.</div> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
