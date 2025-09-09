// app/journey/proof.tsx
"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export function ProofForm({ userQuestId, squadId }: { userQuestId: string; squadId: string }) {
  const supabase = createSupabaseClient();
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = async () => {
    let proof_url: string | undefined;
    if (file) {
      const path = `proofs/${crypto.randomUUID()}`;
      const { data, error } = await supabase.storage.from("proofs").upload(path, file);
      if (!error) {
        const { data: url } = await supabase.storage.from("proofs").createSignedUrl(data.path, 60*60*24*7);
        proof_url = url.signedUrl;
      }
    }
    await supabase.from("user_quests").update({ proof_url, note }).eq("id", userQuestId);
    await supabase.from("posts").insert({ squad_id: squadId, body: note, proof_id: userQuestId });
    setNote("");
    setFile(null);
  };

  return (
    <div className="space-y-2">
      <textarea className="w-full border p-2" placeholder="Kurz: Was hast du gemacht?" value={note} onChange={e=>setNote(e.target.value)} />
      <input type="file" accept="image/*" capture="environment" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <button className="btn btn-secondary" onClick={submit}>Im Campfire teilen</button>
    </div>
  );
}
