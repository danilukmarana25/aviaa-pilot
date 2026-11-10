import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatCard } from './StatCard';
import { THEME } from '../constants/theme';

export type StatItem = {
  key: string;
  value: number | string;
  label: string;
  accent?: string;
  suffix?: string;
};

function isVisible(item: StatItem): boolean {
  return !(
    item.value === undefined ||
    item.value === null ||
    item.value === 0 ||
    item.value === '' ||
    item.value === '0'
  );
}

/** A single stat is never left alone — the row needs two cards to exist. */
export function StatRow({ items }: { items: StatItem[] }) {
  const visible = items.filter(isVisible);
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.key} style={styles.slot}>
          <StatCard
            value={item.value}
            label={item.label}
            accent={item.accent}
            suffix={item.suffix}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: THEME.spacing.sm + 4,
  },
  slot: {
    flex: 1,
  },
});

export default StatRow;
