import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { BOARD_FRAME, RING_SIZE, RUNWAY_W } from '../constants/config';
import { THEME } from '../constants/theme';
import { TIER_SHORT } from '../game/landing';
import type { Tier } from '../game/scoring';

export type LandingStripProps = {
  zoneW: number;
  cycleMs: number;
  frozen: boolean;
  tier: Tier | null;
  laneGuides: boolean;
  onResolve: (distancePx: number, ringX: number) => void;
};

const TRAVEL = Math.max(10, RUNWAY_W - RING_SIZE);
const ZONE_CENTER = RUNWAY_W / 2;

const TIER_COLOR: Record<Tier, string> = {
  gold: THEME.colors.accent.secondary,
  silver: '#C9C9D2',
  bronze: '#B9763C',
  miss: THEME.colors.accent.primary,
};

/**
 * The precision strip. The ring ping-pongs on translateX; one tap freezes it and
 * the offset from the zone centre decides the tier.
 */
export function LandingStrip({
  zoneW,
  cycleMs,
  frozen,
  tier,
  laneGuides,
  onResolve,
}: LandingStripProps) {
  const x = useRef(new Animated.Value(0)).current;
  const xValue = useRef(0);
  const resolved = useRef(false);
  const badge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = x.addListener(({ value }) => {
      xValue.current = value;
    });
    return () => {
      x.removeListener(id);
    };
  }, [x]);

  useEffect(() => {
    if (frozen) {
      return;
    }
    const half = Math.max(240, cycleMs / 2);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, {
          toValue: TRAVEL,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(x, {
          toValue: 0,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [cycleMs, frozen, x]);

  useEffect(() => {
    if (!frozen || resolved.current) {
      return;
    }
    resolved.current = true;
    x.stopAnimation(() => {
      const ringX = xValue.current;
      const ringCenter = ringX + RING_SIZE / 2;
      onResolve(ringCenter - ZONE_CENTER, ringX);
      Animated.spring(badge, {
        toValue: 1,
        useNativeDriver: true,
        tension: 160,
        friction: 9,
      }).start();
    });
  }, [badge, frozen, onResolve, x]);

  const zone = Math.max(24, Math.min(RUNWAY_W, zoneW));
  const badgeScale = badge.interpolate({
    inputRange: [0, 1],
    outputRange: [1.3, 1],
  });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.baseline} />
      <View
        style={[
          styles.zone,
          { width: zone, left: ZONE_CENTER - zone / 2 },
        ]}
      />
      <View style={[styles.center, { left: ZONE_CENTER - 1 }]} />
      {laneGuides ? (
        <View style={styles.ticks}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={`tick${i}`} style={styles.tick} />
          ))}
        </View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { transform: [{ translateX: x }] }]}>
        <Image
          source={assets.sprite4}
          style={styles.ringImg}
          resizeMode="contain"
        />
      </Animated.View>
      {tier ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.badge,
            {
              borderColor: TIER_COLOR[tier],
              transform: [{ scale: badgeScale }],
            },
          ]}>
          <Text style={[styles.badgeText, { color: TIER_COLOR[tier] }]}>
            {TIER_SHORT[tier]}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: BOARD_FRAME,
    right: BOARD_FRAME,
    bottom: BOARD_FRAME + 6,
    height: RING_SIZE + 56,
    justifyContent: 'flex-end',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    height: 1,
    backgroundColor: THEME.colors.accent.secondary,
    opacity: 0.8,
  },
  zone: {
    position: 'absolute',
    bottom: 26,
    height: 30,
    backgroundColor: 'rgba(244,166,42,0.18)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(244,166,42,0.55)',
  },
  center: {
    position: 'absolute',
    bottom: 26,
    width: 2,
    height: 42,
    backgroundColor: THEME.colors.accent.secondary,
  },
  ticks: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    height: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  ring: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringImg: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: THEME.radius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(10,10,14,0.82)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default LandingStrip;
