import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface XPBarProps {
  currentXP: number;
  maxXP?: number;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, maxXP = 100 }) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.xpText}>{currentXP} XP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  barBackground: {
    height: 24,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  xpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
