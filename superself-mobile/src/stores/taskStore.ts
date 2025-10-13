import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Habit, DailyPlan } from '../types';
import { format } from 'date-fns';
import { calculateStreak, isCompletedToday } from '../lib/streakCalculator';
import { calculateTaskXP, calculateHabitXP } from '../lib/xpEconomy';
import { JOURNEY_CONFIG } from '../constants/config';

interface TaskStore {
  habits: Habit[];
  dailyPlans: Record<string, DailyPlan>;
  
  initializeStore: () => Promise<void>;
  createDefaultHabits: () => void;
  getTodayPlan: () => DailyPlan;
  addTask: (title: string) => Promise<void>;
  toggleTask: (taskId: string, onXPEarned: (xp: number) => void) => Promise<void>;
  toggleHabit: (habitId: string, onXPEarned: (xp: number) => void) => Promise<void>;
  submitReflection: (text: string) => Promise<void>;
  save: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  habits: [],
  dailyPlans: {},

  initializeStore: async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      const storedPlans = await AsyncStorage.getItem('dailyPlans');

      if (storedHabits) {
        set({ habits: JSON.parse(storedHabits) });
      } else {
        get().createDefaultHabits();
      }

      if (storedPlans) {
        set({ dailyPlans: JSON.parse(storedPlans) });
      }
    } catch (error) {
      console.error('Failed to load task data:', error);
    }
  },

  createDefaultHabits: () => {
    const habits: Habit[] = JOURNEY_CONFIG.DEFAULT_HABITS.map((title, idx) => ({
      id: `habit_${idx}`,
      title,
      streak: 0,
      xpValue: 5,
      completedToday: false,
      history: [],
    }));
    set({ habits });
    get().save();
  },

  getTodayPlan: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const plan = get().dailyPlans[today];

    if (plan) return plan;

    const newPlan: DailyPlan = {
      date: today,
      tasks: [],
      habits: get().habits.map((h) => h.id),
      xpEarned: 0,
      xpRedeemed: 0,
      reflectionCompleted: false,
    };

    set((state) => ({
      dailyPlans: { ...state.dailyPlans, [today]: newPlan },
    }));

    return newPlan;
  },

  addTask: async (title: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const task: Task = {
      id: `task_${Date.now()}`,
      title,
      completed: false,
      xpValue: 10,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const todayPlan = state.dailyPlans[today] || get().getTodayPlan();
      return {
        dailyPlans: {
          ...state.dailyPlans,
          [today]: {
            ...todayPlan,
            tasks: [...todayPlan.tasks, task],
          },
        },
      };
    });

    await get().save();
  },

  toggleTask: async (taskId: string, onXPEarned: (xp: number) => void) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    set((state) => {
      const todayPlan = state.dailyPlans[today];
      if (!todayPlan) return state;

      const updatedTasks = todayPlan.tasks.map((task) => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          if (newCompleted) {
            onXPEarned(calculateTaskXP(true));
          }
          return {
            ...task,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString() : undefined,
          };
        }
        return task;
      });

      return {
        dailyPlans: {
          ...state.dailyPlans,
          [today]: { ...todayPlan, tasks: updatedTasks },
        },
      };
    });

    await get().save();
  },

  toggleHabit: async (habitId: string, onXPEarned: (xp: number) => void) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    set((state) => {
      const updatedHabits = state.habits.map((habit) => {
        if (habit.id === habitId) {
          const alreadyCompleted = isCompletedToday(habit.history);
          
          if (alreadyCompleted) {
            // Uncomplete
            return {
              ...habit,
              history: habit.history.filter((d) => d !== today),
              streak: calculateStreak(habit.history.filter((d) => d !== today)),
              completedToday: false,
            };
          } else {
            // Complete
            const newHistory = [...habit.history, today];
            const newStreak = calculateStreak(newHistory);
            onXPEarned(calculateHabitXP(newStreak));
            return {
              ...habit,
              history: newHistory,
              streak: newStreak,
              completedToday: true,
            };
          }
        }
        return habit;
      });

      return { habits: updatedHabits };
    });

    await get().save();
  },

  submitReflection: async (text: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    set((state) => {
      const todayPlan = state.dailyPlans[today] || get().getTodayPlan();
      return {
        dailyPlans: {
          ...state.dailyPlans,
          [today]: {
            ...todayPlan,
            reflectionCompleted: true,
            reflectionText: text,
          },
        },
      };
    });

    await get().save();
  },

  save: async () => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(get().habits));
      await AsyncStorage.setItem('dailyPlans', JSON.stringify(get().dailyPlans));
    } catch (error) {
      console.error('Failed to save task data:', error);
    }
  },
}));
