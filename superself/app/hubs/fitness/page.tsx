// app/fitness-hub/page.tsx

import { MacroTargetsForm } from "@/components/hub/fitness/macro-targets-form";
import { NutritionTracker } from "@/components/hub/fitness/nutrition-tracker";
import { WorkoutTracker } from "@/components/hub/fitness/workout-tracker";


export default function FitnessHubPage() {
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
