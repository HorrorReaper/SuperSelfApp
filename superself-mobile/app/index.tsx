import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';
import { useTaskStore } from '../src/stores/taskStore';
import { XPBar } from '../src/components/XPBar';
import { TaskCard } from '../src/components/TaskCard';
import { HabitCard } from '../src/components/HabitCard';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, initializeUser, addXP } = useUserStore();
  const { habits, getTodayPlan, toggleTask, toggleHabit, initializeStore } = useTaskStore();

  useEffect(() => {
    initializeUser();
    initializeStore();
  }, []);

  const todayPlan = getTodayPlan();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>SuperSelf</Text>
        <Text style={styles.subheader}>Day {profile.journeyDay} of 30</Text>

        <XPBar currentXP={profile.currentXP} />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalXPEarned}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/plan')}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {todayPlan.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id, (xp) => addXP(xp, 'task'))}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits</Text>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id, (xp) => addXP(xp, 'habit'))}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.redeemButton}
          onPress={() => router.push('/redeem')}
        >
          <Text style={styles.redeemButtonText}>💎 Redeem XP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reflectButton}
          onPress={() => router.push('/reflect')}
        >
          <Text style={styles.reflectButtonText}>
            {todayPlan.reflectionCompleted ? '✅ Reflection Done' : '📝 Evening Reflection'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  reflectButton: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  reflectButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
