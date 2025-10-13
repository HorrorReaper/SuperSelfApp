import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, XPTransaction } from '../types';
import { format } from 'date-fns';

interface UserStore {
  profile: UserProfile;
  transactions: XPTransaction[];
  
  initializeUser: () => Promise<void>;
  addXP: (amount: number, source: string) => Promise<void>;
  redeemXP: (amount: number, minutes: number) => Promise<void>;
  incrementStreak: () => Promise<void>;
  getTodayRedeemed: () => number;
  save: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  currentXP: 0,
  totalXPEarned: 0,
  totalXPRedeemed: 0,
  currentStreak: 0,
  longestStreak: 0,
  journeyStartDate: format(new Date(), 'yyyy-MM-dd'),
  journeyDay: 1,
};

export const useUserStore = create<UserStore>((set, get) => ({
  profile: defaultProfile,
  transactions: [],

  initializeUser: async () => {
    try {
      const stored = await AsyncStorage.getItem('userProfile');
      const storedTransactions = await AsyncStorage.getItem('transactions');
      
      if (stored) {
        const profile = JSON.parse(stored);
        const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        set({ profile, transactions });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  },

  addXP: async (amount: number, source: string) => {
    const transaction: XPTransaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount,
      source,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      profile: {
        ...state.profile,
        currentXP: state.profile.currentXP + amount,
        totalXPEarned: state.profile.totalXPEarned + amount,
      },
      transactions: [...state.transactions, transaction],
    }));

    await get().save();
  },

  redeemXP: async (amount: number, minutes: number) => {
    const transaction: XPTransaction = {
      id: Date.now().toString(),
      type: 'redeem',
      amount,
      source: `doomscroll_${minutes}min`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      profile: {
        ...state.profile,
        currentXP: state.profile.currentXP - amount,
        totalXPRedeemed: state.profile.totalXPRedeemed + amount,
        lastRedemptionTime: new Date().toISOString(),
      },
      transactions: [...state.transactions, transaction],
    }));

    await get().save();
  },

  incrementStreak: async () => {
    set((state) => {
      const newStreak = state.profile.currentStreak + 1;
      return {
        profile: {
          ...state.profile,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.profile.longestStreak),
        },
      };
    });
    await get().save();
  },

  getTodayRedeemed: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRedemptions = get().transactions.filter(
      (t) => t.type === 'redeem' && t.timestamp.startsWith(today)
    );

    return todayRedemptions.reduce((total, t) => {
      const minutes = parseInt(t.source.split('_')[1]) || 0;
      return total + minutes;
    }, 0);
  },

  save: async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(get().profile));
      await AsyncStorage.setItem('transactions', JSON.stringify(get().transactions));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },
}));
