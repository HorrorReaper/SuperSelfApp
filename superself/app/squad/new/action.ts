// app/squad/new/actions.ts
"use server";
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";
//squad erstellen
export async function createSquad(name: string) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(); // Authentifizierung des Benutzers
  if (authError || !user) throw new Error("Not authenticated"); // Benutzer nicht authentifiziert, also Fehler auswerfen

  const invite_code = randomBytes(4).toString("hex"); // 8-stelliger Code

  const { data: squad, error } = await supabase
    .from("squads")
    .insert({ name, owner_id: user.id, invite_code })
    .select()
    .single(); // Nur ein Squad wird erstellt
  if (error) throw error;

  await supabase.from("squad_members").insert({ squad_id: squad.id, user_id: user.id, role: "owner" }); //aktueller Nutzer wird als Squad Owner eingetragen
  return squad;
}
