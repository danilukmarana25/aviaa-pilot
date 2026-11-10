import React from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type RoundIconButtonProps = {
  onPress: () => void;
  source?: ImageSourcePropType;
  Icon?: LucideIcon;
  label?: string;
  size?: number;
  iconSize?: 24 | 28;
  accessibilityLabel: string;
  disabled?: boolean;
  testID?: string;
};

export function RoundIconButton({
  onPress,
  source,
  Icon,
  label,
  size = 44,
  iconSize = 24,
  accessibilityLabel,
  disabled = false,
  testID,
}: RoundIconButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.press,
        { width: size, height: size, borderRadius: size / 2 },
        disabled ? styles.disabled : null,
      ]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          { borderRadius: size / 2, transform: [{ scale }] },
        ]}>
        <Image
          source={assets.buttonRound}
          style={[styles.plate, { borderRadius: size / 2 }]}
          resizeMode="cover"
        />
        <View style={styles.center}>
          {source ? (
            <Image
              source={source}
              style={{ width: iconSize, height: iconSize }}
              resizeMode="contain"
            />
          ) : null}
          {!source && Icon ? (
            <Icon
              size={iconSize}
              strokeWidth={1.5}
              color={THEME.colors.text.secondary}
            />
          ) : null}
          {!source && !Icon && label ? (
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.glassLine,
  },
  plate: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text.secondary,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default RoundIconButton;
