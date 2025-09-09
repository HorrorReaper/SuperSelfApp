export type PrimaryGoal =
  | "focus"
  | "sleep"
  | "movement"
  | "learning"
  | "stress"
  | "nutrition";

export type KeystoneHabit =
  | "focus_block"
  | "steps"
  | "lights_down"
  | "mobility"
  | "learning_minutes"
  | "planning";

export type Intake = {
  goal: PrimaryGoal;
  keystoneHabit: KeystoneHabit;
  timeWindow: "morning" | "midday" | "afternoon" | "evening" | "none";
  reminders: { channel: "email" | "push" | "none"; frequency: "daily" | "missed" | "weekly" };
  baseline?: { minutes?: number; steps?: number; sleepWindow?: number };
  constraints?: string[];
  energyPeak?: "morning" | "afternoon" | "evening";
  motivation: "solo" | "buddy" | "cohort" | "private";
  barriers: string[];
  supports: string[];
  graceDay: boolean;
  note?: string;
};

export type DayProgress = {
  day: number; // 1..30
  completed: boolean;
  habitMinutes?: number;
  proofUrl?: string;
  mood?: number; // 1..5
  energy?: number; // 1..5
  notes?: string;
  dateISO: string; // yyyy-MM-dd
};

export type ChallengeState = {
  startDateISO: string; // yyyy-MM-dd
  todayDay: number; // computed from startDate
  streak: number;
  graceUsedThisWeek: number; // 0..1
  days: DayProgress[]; // length up to 30
};
