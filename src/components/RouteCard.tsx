import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { ChallengeRoute } from '../game/routes';
import { formatPoints } from '../game/scoring';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type RouteCardProps = {
  route: ChallengeRoute;
  locked: boolean;
  lockLine: string;
  best: number;
  selected: boolean;
  flashing: boolean;
  onPress: (route: ChallengeRoute) => void;
};

export function RouteCard({
  route,
  locked,
  lockLine,
  best,
  selected,
  flashing,
  onPress,
}: RouteCardProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.98);
  const dots = [0, 1, 2];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={route.name}
      hitSlop={HIT}
      onPress={() => onPress(route)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          selected ? styles.selected : null,
          locked ? styles.locked : null,
          { transform: [{ scale }] },
        ]}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {route.name}
          </Text>
          <View style={styles.dots}>
            {dots.map(i => (
              <View
                key={`d${i}`}
                style={[
                  styles.dot,
                  i < route.difficulty ? styles.dotOn : styles.dotOff,
                ]}
              />
            ))}
          </View>
        </View>
        <Text
          style={[styles.objective, flashing ? styles.flash : null]}
          numberOfLines={2}>
          {locked ? lockLine : route.objective}
        </Text>
        <View style={styles.bottomRow}>
          {locked ? (
            <Lock size={22} strokeWidth={1.5} color={THEME.colors.text.muted} />
          ) : null}
          <Text style={styles.best} numberOfLines={1}>
            {best > 0 ? `BEST ${formatPoints(best)}` : 'NOT FLOWN YET'}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: 96,
  },
  card: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  selected: {
    borderColor: 'rgba(230,57,70,0.75)',
  },
  locked: {
    opacity: 0.45,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.text.primary,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: THEME.colors.accent.secondary,
  },
  dotOff: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  objective: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.text.secondary,
  },
  flash: {
    color: THEME.colors.accent.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  best: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.text.muted,
    fontVariant: ['tabular-nums'],
  },
});

export default RouteCard;
