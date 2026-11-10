import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const ICON = 24;

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  width?: number | `${number}%`;
  height?: number;
  tone?: 'red' | 'amber';
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  Icon,
  disabled = false,
  width = '100%',
  height = 56,
  tone = 'red',
  testID,
}: PrimaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const colors =
    tone === 'amber'
      ? [...THEME.gradients.reward]
      : [...THEME.gradients.primary];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.press,
        { width, height },
        disabled ? styles.disabled : THEME.shadows.cta,
      ]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, { transform: [{ scale }] }]}>
        <Image
          source={assets.buttonRect}
          style={styles.plate}
          resizeMode="cover"
        />
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}
        />
        <View style={styles.row}>
          {Icon ? <Icon size={ICON} strokeWidth={1.5} color="#FFFFFF" /> : null}
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: THEME.radius.lg,
  },
  fill: {
    flex: 1,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  grad: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 17,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default PrimaryButton;
