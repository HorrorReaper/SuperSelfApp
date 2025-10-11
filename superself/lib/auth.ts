import { createSupabaseClient, supabase } from './supabase'

export async function signUp(email: string, password: string, desiredUsername: string, displayName?: string, avatarUrl?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: desiredUsername,   // optional
        name: displayName,           // optional
        avatar_url: avatarUrl        // optional
      }
    }
  })
  return { data, error }
} // Funktion um einen neuen Benutzer zu registrieren mit E-Mail und Passwort

export async function signIn(email: string, password: string) {
  //const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
} // Funktion um sich mit E-Mail und Passwort anzumelden

export async function signOut() {
  //const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
} // Funktion um sich abzumelden

export async function getCurrentUser() {
  //const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
} // Funktion um den aktuellen Benutzer abzurufen

export async function getCurrentUsername(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data?.name || null;
} // Funktion um den Namen anhand der Benutzer-ID abzurufen