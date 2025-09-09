// app/journey/page.tsx
import { supabase } from "@/lib/supabase";
import StartQuestButton from "@/components/journey/StartQuestButton";

export default async function JourneyPage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Einfach: 1 feste Journey "focus-detox"
  const { data: journey } = await supabase.from("journeys").select("id").eq("slug", "focus-detox").single();

  // Heutiger Index = Zahl der Tage seit Join in erstem Squad (vereinfachung)
  const { data: membership } = await supabase.from("squad_members").select("joined_at,squad_id").eq("user_id", user.id).limit(1).single();
  const dayIndex = Math.max(1, Math.min(10, Math.floor((Date.now() - new Date(membership?.joined_at ?? Date.now()).getTime()) / (1000*60*60*24)) + 1));

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("journey_id", journey!.id)
    .eq("day_index", dayIndex)
    .single();

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold">Tag {dayIndex}: {quest?.title}</h1>
      <p className="text-muted-foreground mt-2">{quest?.content?.instructions}</p>
      <StartQuestButton questId={quest!.id} />
      {/* Campfire-Komponente hier einbinden */}
    </div>
  );
}
