import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RedemptionTimerProps {
  durationMinutes: number;
  onComplete: () => void;
}

export const RedemptionTimer: React.FC<RedemptionTimerProps> = ({
  durationMinutes,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <Text style={styles.label}>Time remaining</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
});
