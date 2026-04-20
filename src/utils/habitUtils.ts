import { differenceInDays, parseISO, startOfDay, isAfter, addDays, format } from 'date-fns';
import { Habit, CheckIn } from '../store/useHabitStore';

export const getCurrentHabitDay = (habit: Habit): number => {
  const startDate = startOfDay(parseISO(habit.startDate));
  const today = startOfDay(new Date());
  return differenceInDays(today, startDate) + 1;
};

export const calculateStreak = (habit: Habit): number => {
  // Cumulative Streak: The streak is the total number of days successfully checked in.
  // Missing a day does not reset this count to zero (as per user request),
  // it just means the streak doesn't increment for that day.
  return habit.checkIns.length;
};

export const getCompletionPercentage = (habit: Habit): number => {
  return Math.round((habit.checkIns.length / habit.duration) * 100);
};

export const isDayCheckable = (habit: Habit, day: number): boolean => {
  const currentDay = getCurrentHabitDay(habit);
  
  // Strict rule: You can only check in for EXACTLY today.
  // No checking in for missed past days, and no future days.
  return day === currentDay && day <= habit.duration;
};

export const getDayDate = (startDateStr: string, day: number): string => {
  const startDate = parseISO(startDateStr);
  return format(addDays(startDate, day - 1), 'MMM d, yyyy');
};
