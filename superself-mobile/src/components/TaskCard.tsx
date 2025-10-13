import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.card, task.completed && styles.cardCompleted]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {task.completed && <View style={styles.checkboxFilled} />}
      </View>
      <Text style={[styles.title, task.completed && styles.titleCompleted]}>
        {task.title}
      </Text>
      <Text style={styles.xp}>+{task.xpValue} XP</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  xp: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});
