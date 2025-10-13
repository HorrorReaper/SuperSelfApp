import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';

export const calculateStreak = (completionDates: string[]): number => {
  if (completionDates.length === 0) return 0;

  const sortedDates = completionDates
    .map((d) => startOfDay(parseISO(d)))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfDay(new Date());
  let streak = 0;

  // Check if completed today or yesterday
  const daysDiff = differenceInDays(today, sortedDates[0]);
  if (daysDiff > 1) return 0; // Streak broken

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = startOfDay(new Date(today.getTime() - i * 24 * 60 * 60 * 1000));
    if (sortedDates[i].getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const isCompletedToday = (completionDates: string[]): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return completionDates.includes(today);
};
