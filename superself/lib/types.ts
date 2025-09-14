export type PrimaryGoal =
  | "focus"
  | "sleep"
  | "movement"
  | "learning"
  | "stress"
  | "nutrition"
  | "overall improvement";

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

export type TinyHabitType = "timeboxing" | "lights_down" | "mobility";

export type TinyHabitConfig = {
  type: TinyHabitType;
  startedOnDay: number;
  active: boolean;
};

export type TinyHabitCompletion = {
  day: number;
  done: boolean;
  minutes?: number;
  note?: string;
};

export type MicroBrief = {
  day: number;
  title: string;
  tldr: string; // 1-sentence summary
  content: string; // short tips 60–120s text
  controlquestion?: string; // prompt to reflect on
  actionLabel: string; // button label for the action
  action?: DailyActionConfig; // optional action to do today
};

export type ChallengeState = {
  startDateISO: string;
  todayDay: number;
  streak: number;
  graceUsedThisWeek: number;
  days: DayProgress[];
  tinyHabit?: TinyHabitConfig | null;
  tinyHabitCompletions?: TinyHabitCompletion[];

  // NEW: track current challenge week to reset grace
  _graceWeekIndex?: number;
  // XP system (added earlier if you followed gamification step)
  xp?: number;
  level?: number;
  xpLog?: XpEvent[];
  lastLevelUpISO?: string;
};
export type ActionKind =
  | "timer"          // needs minutes target + proof via timer
  | "checklist"      // list of items to tick (e.g., identity + 3 behaviors)
  | "text"           // free text answer (e.g., control question, identity rewrite)
  | "schedule"       // generate ICS / open Google Calendar prefill
  | "toggle"         // simple “done” checkbox
  | "photo";         // optional photo proof

  export type DailyActionConfig = {
  kind: ActionKind;
  targetMinutes?: number;               // for timer
  checklistItems?: string[];            // for checklist
  requireAnswer?: boolean;              // for text days
  scheduleTemplate?: {                  // for schedule
    title: string;
    durationMinutes: number;
    when: "today" | "tomorrow" | "custom";
  };
  allowPhotoProof?: boolean;            // for identity/environment days
};

export type DayProgress = {
  day: number;
  completed: boolean;
  habitMinutes?: number;
  proofUrl?: string;
  mood?: number;
  energy?: number;
  notes?: string;
  dateISO: string;
  sessions?: { id: string; minutes: number; startedAt: string; endedAt?: string }[];
  actionData?: DayActionData;

  // NEW:
  completedAtISO?: string;     // when user actually completed
  creditedToStreak?: boolean;  // whether this completion should count for streak
  usedGrace?: boolean;         // if grace was consumed for this day
};
// lib/types.ts (add or confirm)
export type MoodLevel = "super" | "good" | "normal" | "not_really" | "terrible";

export type DayCheckin = {
  day: number;
  mood: MoodLevel;
  note?: string;
  createdAtISO: string;
};
// lib/types.ts
export type DayActionData = {
  kind?: "timer" | "checklist" | "text" | "schedule" | "toggle" | "photo";
  checklist?: { label: string; done: boolean }[];
  text?: string;
  scheduled?: boolean;
  toggleDone?: boolean;
  photoProof?: string; // data URL or remote URL
};
// lib/types.ts
export type XpEvent = {
  id: string;
  day?: number;              // which challenge day this ties to
  amount: number;            // +xp
  reason: "day_complete" | "weekly_retro" | "mood_checkin" | "tiny_habit" | string;
  createdAtISO: string;
};





