import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import {
  AIRWAY_W,
  BOARD_FRAME,
  LANES,
  STAMP_SIZE,
  TURB_W,
} from '../constants/config';
import { THEME } from '../constants/theme';
import type { LiveEntity, Phase } from '../hooks/useFlightSession';
import type { Tier } from '../game/scoring';
import { LandingStrip } from './LandingStrip';
import { PlaneSprite } from './PlaneSprite';

export type AirwayCanvasProps = {
  entities: LiveEntity[];
  lane: number;
  laneH: number;
  height: number;
  phase: Phase;
  invulnerable: boolean;
  shakeKey: number;
  reducedMotion: boolean;
  laneGuides: boolean;
  zoneW: number;
  cycleMs: number;
  landRequested: boolean;
  tier: Tier | null;
  onResolve: (distancePx: number, ringX: number) => void;
  onLayoutHeight: (h: number) => void;
};

function ParallaxBand({
  top,
  height,
  opacity,
  duration,
  frozen,
}: {
  top: number;
  height: number;
  opacity: number;
  duration: number;
  frozen: boolean;
}) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (frozen) {
      x.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [duration, frozen, x]);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -AIRWAY_W],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.band,
        { top, height, opacity, transform: [{ translateX }] },
      ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** z0 gradient -> z1 parallax -> z2 airway frame -> z3 actors. */
export function AirwayCanvas({
  entities,
  lane,
  laneH,
  height,
  phase,
  invulnerable,
  shakeKey,
  reducedMotion,
  laneGuides,
  zoneW,
  cycleMs,
  landRequested,
  tier,
  onResolve,
  onLayoutHeight,
}: AirwayCanvasProps) {
  const shake = useRef(new Animated.Value(0)).current;
  const lastShake = useRef(shakeKey);

  useEffect(() => {
    if (shakeKey === lastShake.current) {
      return;
    }
    lastShake.current = shakeKey;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
  }, [shake, shakeKey]);

  const shakeX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-6, 0, 6],
  });

  const showStrip = phase === 'landing' || phase === 'resolved';
  const visible = entities.filter(
    e => (!e.dead || e.pop > 0) && e.x > -TURB_W - 10 && e.x < AIRWAY_W + 40,
  );

  const separators = [];
  for (let i = 1; i < LANES; i++) {
    separators.push(
      <View
        key={`sep${i}`}
        style={[styles.separator, { top: BOARD_FRAME + i * laneH }]}
      />,
    );
  }

  return (
    <View
      style={styles.area}
      onLayout={e => onLayoutHeight(e.nativeEvent.layout.height)}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.board,
          { height, transform: [{ translateX: shakeX }] },
        ]}>
        <LinearGradient
          colors={[...THEME.gradients.game]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <ParallaxBand
          top={Math.round(height * 0.18)}
          height={26}
          opacity={0.08}
          duration={26000}
          frozen={reducedMotion}
        />
        <ParallaxBand
          top={Math.round(height * 0.62)}
          height={18}
          opacity={0.12}
          duration={13000}
          frozen={reducedMotion}
        />

        {laneGuides ? separators : null}

        {laneH > 0
          ? visible.map(e => {
              if (e.kind === 'stamp') {
                const p = e.dead ? 1 - e.pop / 260 : 0;
                const scale = e.dead ? (p < 0.5 ? 1 + 1.6 * p : 1.4 - 2.8 * (p - 0.5)) : 1;
                return (
                  <View
                    key={e.id}
                    pointerEvents="none"
                    style={[
                      styles.stamp,
                      {
                        left: e.x,
                        top:
                          BOARD_FRAME +
                          e.lane * laneH +
                          (laneH - STAMP_SIZE) / 2,
                        opacity: e.dead ? Math.max(0, 1 - p) : 1,
                        transform: [{ scale: Math.max(0.01, scale) }],
                      },
                    ]}>
                    <Image
                      source={assets.sprite2}
                      style={styles.stampImg}
                      resizeMode="contain"
                    />
                  </View>
                );
              }
              const h = Math.max(16, laneH - 14);
              return (
                <View
                  key={e.id}
                  pointerEvents="none"
                  style={[
                    styles.turb,
                    {
                      left: e.x,
                      top: BOARD_FRAME + e.lane * laneH + 7,
                      height: h,
                    },
                  ]}>
                  <Image
                    source={assets.sprite3}
                    style={{ width: TURB_W, height: h }}
                    resizeMode="contain"
                  />
                  <View style={styles.turbTint} />
                </View>
              );
            })
          : null}

        {laneH > 0 ? (
          <PlaneSprite
            lane={lane}
            laneH={laneH}
            invulnerable={invulnerable}
            reducedMotion={reducedMotion}
          />
        ) : null}

        {showStrip ? (
          <LandingStrip
            zoneW={zoneW}
            cycleMs={cycleMs}
            frozen={landRequested}
            tier={tier}
            laneGuides={laneGuides}
            onResolve={onResolve}
          />
        ) : null}

        <View pointerEvents="none" style={styles.cornerTL} />
        <View pointerEvents="none" style={styles.cornerBR} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  board: {
    width: AIRWAY_W,
    borderRadius: THEME.radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(10,10,14,0.35)',
  },
  band: {
    position: 'absolute',
    left: 0,
    width: AIRWAY_W * 2,
  },
  separator: {
    position: 'absolute',
    left: BOARD_FRAME,
    right: BOARD_FRAME,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  stamp: {
    position: 'absolute',
    width: STAMP_SIZE,
    height: STAMP_SIZE,
  },
  stampImg: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
  },
  turb: {
    position: 'absolute',
    width: TURB_W,
  },
  turbTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(230,57,70,0.18)',
    borderRadius: 12,
  },
  cornerTL: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 18,
    height: 18,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(244,166,42,0.45)',
  },
  cornerBR: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 18,
    height: 18,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(244,166,42,0.45)',
  },
});

export default AirwayCanvas;
