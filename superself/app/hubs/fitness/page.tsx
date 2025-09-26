// app/fitness-hub/page.tsx
'use client';
import { redirect } from "next/navigation";
import { MacroTargetsForm } from "@/components/hub/fitness/macro-targets-form";
import { NutritionTracker } from "@/components/hub/fitness/nutrition-tracker";
import { WorkoutTracker } from "@/components/hub/fitness/workout-tracker";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { useEffect } from "react";
import { ExercisesCatalog } from "@/components/hub/fitness/exercises-catalog";
import { UserExercisesList } from "@/components/hub/fitness/user-exercises-list";


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
        <section>
        <h2 className="text-xl font-semibold">Exercise Catalog</h2>
        <p className="text-sm text-muted-foreground">Browse exercises and add them to your library.</p>
        <div className="mt-4">
          <ExercisesCatalog />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">My Exercise Library</h2>
        <p className="text-sm text-muted-foreground">Use your saved movements while tracking workouts.</p>
        <div className="mt-4">
          <UserExercisesList />
        </div>
      </section>
      </main>
    </>
  );
}
