"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createGroup} from "@/lib/groups";
import { GroupVisibility } from "@/lib/types";

export function GroupCreateForm() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState<GroupVisibility>("public");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please provide a group name"); return; }
    setSubmitting(true);
    try {
      const g = await createGroup({ name: name.trim(), description: desc.trim() || undefined, visibility, avatar_url: avatarUrl || undefined });
      toast.success("Group created", { description: g.name });
      router.push(`/groups/${g.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Could not create group", { description: msg });
    } finally { setSubmitting(false); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a group</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Morning Crew" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Early risers doing the 30‑day challenge together." />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v)=>setVisibility(v as GroupVisibility)}>
              <SelectTrigger><SelectValue placeholder="Select visibility" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (anyone can join)</SelectItem>
                <SelectItem value="private">Private (invite or request)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL (optional)</Label>
            <Input id="avatar" value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting}>Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
