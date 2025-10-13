export interface Task {
  id: string;
  title: string;
  completed: boolean;
  xpValue: number;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  xpValue: number;
  completedToday: boolean;
  lastCompletedDate?: string;
  history: string[]; // ISO date strings
}

export interface XPTransaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  source: string; // 'task', 'habit', 'streak_bonus', 'doomscroll'
  timestamp: string;
}

export interface DailyPlan {
  date: string; // ISO date
  tasks: Task[];
  habits: string[]; // habit IDs
  xpEarned: number;
  xpRedeemed: number;
  reflectionCompleted: boolean;
  reflectionText?: string;
}

export interface UserProfile {
  currentXP: number;
  totalXPEarned: number;
  totalXPRedeemed: number;
  currentStreak: number;
  longestStreak: number;
  journeyStartDate: string;
  journeyDay: number; // 1-30
  lastRedemptionTime?: string;
}

export interface RedemptionConfig {
  xpPer10Min: number;
  maxMinutesPerDay: number;
  cooldownHours: number;
  dailyXPCap: number;
}
