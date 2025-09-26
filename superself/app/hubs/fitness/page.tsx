// app/fitness-hub/page.tsx
'use client';
import { redirect } from "next/navigation";
import { MacroTargetsForm } from "@/components/hub/fitness/macro-targets-form";
import { NutritionTracker } from "@/components/hub/fitness/nutrition-tracker";
import { WorkoutTracker } from "@/components/hub/fitness/workout-tracker";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { useEffect } from "react";


export default function FitnessHubPage() {
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) redirect("/dashboard");
      const { data } = await supabase
    .from("profiles")
    .select("fitness_setup_completed")
    .eq("id", user.id)
    .single();

  if (!data?.fitness_setup_completed) {
    redirect("/hubs/fitness/intro");
  }
    };
    fetchUser();
  }, []);
  

  
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <WorkoutTracker />
        <NutritionTracker />
        <MacroTargetsForm />
      </main>
    </>
  );
}
