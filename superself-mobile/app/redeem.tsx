import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';
import { canRedeem } from '../src/lib/xpEconomy';
import { REDEMPTION_CONFIG } from '../src/constants/config';
import { RedemptionTimer } from '../src/components/RedemptionTimer';

export default function RedeemScreen() {
  const router = useRouter();
  const { profile, redeemXP, getTodayRedeemed } = useUserStore();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionMinutes, setRedemptionMinutes] = useState(0);

  const todayRedeemed = getTodayRedeemed();

  const handleRedeem = (minutes: number) => {
    const xpCost = (minutes / 10) * REDEMPTION_CONFIG.XP_PER_10_MIN;
    const check = canRedeem(profile.currentXP, minutes, profile.lastRedemptionTime, todayRedeemed);

    if (!check.allowed) {
      Alert.alert('Cannot Redeem', check.reason);
      return;
    }

    Alert.alert(
      'Are you sure?',
      `Spend ${xpCost} XP for ${minutes} minutes of doomscrolling?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            redeemXP(xpCost, minutes);
            setRedemptionMinutes(minutes);
            setIsRedeeming(true);
          },
        },
      ]
    );
  };

  if (isRedeeming) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enjoy your break! 🎉</Text>
        <RedemptionTimer
          durationMinutes={redemptionMinutes}
          onComplete={() => {
            setIsRedeeming(false);
            router.back();
          }}
        />
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => {
            setIsRedeeming(false);
            router.back();
          }}
        >
          <Text style={styles.endButtonText}>End Early</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Redeem XP</Text>
      <Text style={styles.subtitle}>Current XP: {profile.currentXP}</Text>
      <Text style={styles.subtitle}>
        Redeemed today: {todayRedeemed}/{REDEMPTION_CONFIG.MAX_MINUTES_PER_DAY} min
      </Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleRedeem(10)}
        >
          <Text style={styles.optionTime}>10 min</Text>
          <Text style={styles.optionCost}>30 XP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleRedeem(20)}
        >
          <Text style={styles.optionTime}>20 min</Text>
          <Text style={styles.optionCost}>60 XP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  options: {
    marginTop: 40,
  },
  optionCard: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionCost: {
    fontSize: 18,
    color: '#9C27B0',
    marginTop: 8,
  },
  endButton: {
    marginTop: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#888',
    alignItems: 'center',
  },
  endButtonText: {
    color: '#888',
    fontSize: 16,
  },
});
