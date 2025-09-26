import { ActivityLevel, SetupInput } from "@/lib/types";

const activityMultiplier: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function computeTargets(input: SetupInput) {
  const { heightCm, weightKg, ageYears, sex } = input;
  const ppk = input.proteinPerKg ?? 1.8;
  const fpk = input.fatPerKg ?? 0.8;

  // Mifflin–St Jeor BMR
  const sexAdj = sex === "male" ? 5 : sex === "female" ? -161 : -78; // neutral midpoint for "other"
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + sexAdj);

  const tdee = Math.round(bmr * activityMultiplier[input.activityLevel]);
  const goalAdj = input.goal === "lose" ? -0.15 : input.goal === "gain" ? 0.10 : 0.0;
  const calories = Math.max(1200, Math.round(tdee * (1 + goalAdj)));

  const proteinG = Math.round(ppk * weightKg);
  const fatG = Math.round(fpk * weightKg);
  const calsFromPF = proteinG * 4 + fatG * 9;
  const carbsG = Math.max(0, Math.round((calories - calsFromPF) / 4));

  return { calories, protein: proteinG, fat: fatG, carbs: carbsG };
}

// Unit utilities
export function lbsToKg(lbs: number) { return lbs * 0.45359237; }
export function inchesToCm(inches: number) { return inches * 2.54; }