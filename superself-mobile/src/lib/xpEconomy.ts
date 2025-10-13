import { XP_CONFIG, REDEMPTION_CONFIG } from '../constants/config';
import { XPTransaction } from '../types';

export const calculateTaskXP = (isCompleted: boolean): number => {
  return isCompleted ? XP_CONFIG.TASK_BASE : 0;
};

export const calculateHabitXP = (streak: number): number => {
  const base = XP_CONFIG.HABIT_BASE;
  const bonus = streak > 3 ? (streak - 3) * XP_CONFIG.STREAK_BONUS : 0;
  return base + bonus;
};

export const calculateDailyXP = (transactions: XPTransaction[]): number => {
  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = transactions.filter(
    (t) => t.type === 'earn' && t.timestamp.startsWith(today)
  );
  return Math.min(
    todayEarnings.reduce((sum, t) => sum + t.amount, 0),
    XP_CONFIG.DAILY_CAP
  );
};

export const canRedeem = (
  currentXP: number,
  minutesRequested: number,
  lastRedemptionTime: string | undefined,
  todayRedeemed: number
): { allowed: boolean; reason?: string } => {
  const xpNeeded = (minutesRequested / 10) * REDEMPTION_CONFIG.XP_PER_10_MIN;

  if (currentXP < xpNeeded) {
    return { allowed: false, reason: 'Not enough XP' };
  }

  if (todayRedeemed + minutesRequested > REDEMPTION_CONFIG.MAX_MINUTES_PER_DAY) {
    return { allowed: false, reason: 'Daily limit reached' };
  }

  if (lastRedemptionTime) {
    const hoursSinceLastRedemption =
      (Date.now() - new Date(lastRedemptionTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastRedemption < REDEMPTION_CONFIG.COOLDOWN_HOURS) {
      return { allowed: false, reason: 'Cooldown active' };
    }
  }

  return { allowed: true };
};
