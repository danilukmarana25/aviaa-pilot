import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

export type StatCardProps = {
  value: number | string;
  label: string;
  accent?: string;
  suffix?: string;
};

/**
 * One shape for every stat in the app. No raster icon — an accent dot carries the
 * colour, so a row of three cards is pixel-identical apart from the number.
 * Renders null when there is nothing to show (never an empty rounded box).
 */
export function StatCard({
  value,
  label,
  accent = THEME.colors.accent.secondary,
  suffix,
}: StatCardProps) {
  const empty =
    value === undefined ||
    value === null ||
    value === 0 ||
    value === '' ||
    value === '0';
  if (empty) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {String(value)}
        {suffix ? suffix : ''}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: THEME.colors.text.muted,
  },
});

export default StatCard;
