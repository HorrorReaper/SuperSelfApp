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
  longcontent?: string; // optional deep-dive
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

//Gruppen
export type GroupVisibility = "public" | "private";
export type GroupRole = "owner" | "admin" | "member";

export type Group = {
  id: number;
  slug: string | null;
  name: string;
  description: string | null;
  avatar_url: string | null;
  visibility: GroupVisibility;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: number;
  group_id: number;
  user_id: string;
  role: GroupRole;
  created_at: string;
  profile: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
    level: number | null;
    xp: number | null;
  } | null;
};

export type ICSOptions = {
  title: string;
  description?: string;
  location?: string;
  start: Date; // local start time, we’ll store as UTC in ICS
  durationMinutes: number;
  allDay?: boolean;
};

//Social
export type Profile = {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak: number;
  today_day: number;
};

export type Friendship = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: number;
  actor_id: string;
  type: "day_complete" | "level_up" | "tiny_habit" | "weekly_retro" | "mood_checkin" | "cheer";
  day: number | null;
  xp: number | null;
  message: string | null;
  created_at: string;
};

//Productivity Hub
export type Task = {
  id: number;
  user_id: string;
  text: string;
  essential: boolean;
  frog: boolean;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Note = {
  id: number;
  user_id: string;
  title: string | null;
  content: string;
  is_scratchpad: boolean;
  created_at: string;
  updated_at: string;
};
export type WidgetId = "calendar" | "tasks" | "notepad" | "timer";
export type WidgetItem = { id: WidgetId; visible: boolean };

//learning hub
export type Deck = {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Card = {
  id: number;
  deck_id: number;
  user_id: string;
  front: string;
  back: string;
  card_type: "basic" | "true_false" | "typing";
  tags: string[] | null;
  box: number;
  ease: number;
  interval_days: number;
  due_date: string | null;
  last_reviewed_at: string | null;
  total_reviews: number;
  correct_reviews: number;
  created_at: string;
  updated_at: string;
};


export type PublicProfile = {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  level: number | null;
  xp: number | null;
};

export type PublicAchievement = {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  points: number | null;
  unlocked_at: string | null;
};

// journal
export type FieldType = "scale_1_5" | "boolean" | "short_text" | "long_text" | "select_one" | "select_many";

export type JournalTemplate = {
  id: number;
  user_id: string;
  name: string;
};

export type JournalField = {
  id: number;
  template_id: number;
  label: string;
  helper: string | null;
  type: FieldType;
  required: boolean;
  order_index: number;
  options: { items?: string[] } | null;
};


//Fitnesshub
export type WorkoutSession = {
  id: number;
  user_id: string;
  date: string;
  title: string | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
  total_volume: number;
};

export type WorkoutSet = {
  id: number;
  session_id: number;
  user_id: string;
  exercise_id: number | null;
  custom_exercise: string | null;
  set_index: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  volume: number | null;
  notes: string | null;
};

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type Sex = "male" | "female" | "other";

export type SetupInput = {
  heightCm: number;
  weightKg: number;
  ageYears: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  proteinPerKg?: number; // default 1.8
  fatPerKg?: number;     // default 0.8
};


export type Exercise = {
  id: number;
  user_id: string;
  name: string;
  muscle_group: string | null;
};

export type Meal = {
  id: number;
  user_id: string;
  date: string;
  time: string | null;
  name: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes: string | null;
};