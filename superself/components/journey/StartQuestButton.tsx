// app/journey/start-quest-button.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StartQuestButton({ questId }: { questId: string }) {
  const [state, setState] = useState<"idle"|"running"|"done">("idle");

  const start = async () => {
    setState("running");
    const { data: { user } } = await supabase.auth.getUser();
    const { data: member } = await supabase.from("squad_members").select("squad_id").eq("user_id", user!.id).limit(1).single();
    await supabase.from("user_quests").insert({
      user_id: user!.id,
      squad_id: member!.squad_id,
      quest_id: questId,
      status: "running",
      started_at: new Date().toISOString()
    });
  };

  const finish = async () => {
    setState("done");
    const { data: uq } = await supabase.from("user_quests")
      .select("id").eq("quest_id", questId).order("started_at", { ascending: false }).limit(1).single();
    await supabase.from("user_quests").update({
      status: "done",
      completed_at: new Date().toISOString()
    }).eq("id", uq!.id);
  };

  if (state === "idle") return <button className="btn btn-primary" onClick={start}>Quest starten</button>;
  if (state === "running") return <button className="btn btn-success" onClick={finish}>Abschließen</button>;
  return <div className="text-green-600 font-medium">Erledigt! Beweis posten im Campfire</div>;
}
