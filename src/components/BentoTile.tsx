import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type BentoTileProps = {
  title: string;
  caption?: string;
  Icon?: LucideIcon;
  height: number;
  accent?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  align?: 'center' | 'left';
  testID?: string;
};

/** The M3 bento cell. Minimum height 72 so every tile is a legal touch target. */
export function BentoTile({
  title,
  caption,
  Icon,
  height,
  accent = THEME.colors.text.secondary,
  onPress,
  children,
  align = 'center',
  testID,
}: BentoTileProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const h = Math.max(72, height);

  const body = (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.fill, { transform: [{ scale }] }]}>
      <LinearGradient
        colors={[...THEME.gradients.tile]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.inner,
          align === 'left' ? styles.innerLeft : styles.innerCenter,
        ]}>
        {Icon ? <Icon size={22} strokeWidth={1.5} color={accent} /> : null}
        <Text
          style={[
            styles.title,
            align === 'left' ? styles.textLeft : styles.textCenter,
          ]}
          numberOfLines={1}>
          {title}
        </Text>
        {caption ? (
          <Text
            style={[
              styles.caption,
              align === 'left' ? styles.textLeft : styles.textCenter,
            ]}
            numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
        {children ?? null}
      </View>
    </Animated.View>
  );

  if (!onPress) {
    return <View style={[styles.press, { height: h }]}>{body}</View>;
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.press, { height: h }, THEME.shadows.tile]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: THEME.radius.lg,
  },
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  innerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.text.secondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.text.muted,
  },
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
});

export default BentoTile;
