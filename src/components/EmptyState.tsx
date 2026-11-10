import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export type EmptyStateProps = {
  text: string;
  Icon?: LucideIcon;
};

/** A list or panel that can be empty always says so — never a blank area. */
export function EmptyState({ text, Icon }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      {Icon ? (
        <Icon size={22} strokeWidth={1.5} color={THEME.colors.text.muted} />
      ) : null}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: 10,
    borderRadius: THEME.radius.lg,
    backgroundColor: 'rgba(24,24,28,0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  text: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: THEME.colors.text.secondary,
  },
});

export default EmptyState;
