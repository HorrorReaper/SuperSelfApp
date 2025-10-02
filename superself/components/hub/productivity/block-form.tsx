// components/nextday/block-form.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function BlockForm({ planId, onAdded }: { planId: string; onAdded: () => void; }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("focus");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  async function add() {
    const start_minute = toMinutes(start);
    const end_minute = toMinutes(end);
    if (!title.trim()) { toast.error("Title required"); return; }
    if (end_minute <= start_minute) { toast.error("End must be after start"); return; }
    const { error } = await supabase
      .from("day_plan_blocks")
      .insert({ plan_id: planId, title, kind, start_minute, end_minute });
    if (error) toast.error("Could not add block", { description: error.message });
    else { toast.success("Block added"); onAdded(); setTitle(""); }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input className="w-[200px]" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <Select value={kind} onValueChange={setKind}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kind" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="focus">Focus</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="break">Break</SelectItem>
          <SelectItem value="mobility">Mobility</SelectItem>
          <SelectItem value="workout">Workout</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Input className="w-[120px]" type="time" value={start} onChange={(e)=>setStart(e.target.value)} />
      <Input className="w-[120px]" type="time" value={end} onChange={(e)=>setEnd(e.target.value)} />
      <Button onClick={add}>Add Block</Button>
    </div>
  );
}
