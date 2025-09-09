// app/squad/join/[code]/actions.ts
"use server";
import { supabase } from "@/lib/supabase";

export async function joinSquadByCode(code: string) {
  const { data: { user } } = await supabase.auth.getUser(); // Authentifizierung des Benutzers
  if (!user) throw new Error("Not authenticated");

  const { data: squad } = await supabase.from("squads").select("id").eq("invite_code", code).single(); // Squad anhand des Einladungs-Codes abrufen
  if (!squad) throw new Error("Invalid code");

  // upsert Mitgliedschaft
  await supabase.from("squad_members").upsert({ squad_id: squad.id, user_id: user.id }, { onConflict: "squad_id,user_id" }); // Mitgliedschaft aktualisieren oder erstellen
  return squad.id;
}
