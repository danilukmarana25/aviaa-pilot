import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const ICON = 24;

export type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  width?: number | `${number}%`;
  height?: number;
  tone?: 'neutral' | 'danger';
  testID?: string;
};

export function SecondaryButton({
  label,
  onPress,
  Icon,
  width = '100%',
  height = 48,
  tone = 'neutral',
  testID,
}: SecondaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const danger = tone === 'danger';

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.press, { width, height }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          danger ? styles.fillDanger : null,
          { transform: [{ scale }] },
        ]}>
        <View style={styles.row}>
          {Icon ? (
            <Icon
              size={ICON}
              strokeWidth={1.5}
              color={danger ? THEME.colors.accent.primary : THEME.colors.text.secondary}
            />
          ) : null}
          <Text
            style={[styles.label, danger ? styles.labelDanger : null]}
            numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: THEME.radius.md,
  },
  fill: {
    flex: 1,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  fillDanger: {
    backgroundColor: 'rgba(230,57,70,0.10)',
    borderColor: 'rgba(230,57,70,0.55)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: ICON,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.secondary,
  },
  labelDanger: {
    color: THEME.colors.accent.primary,
  },
});

export default SecondaryButton;
