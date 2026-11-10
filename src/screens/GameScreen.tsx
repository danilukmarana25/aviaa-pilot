import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import {
  AIRWAY_W,
  BAR_BOTTOM,
  BAR_H,
  BOARD_FRAME,
  DIFFICULTY,
  LANES,
  NO_SPAWN_STRIP,
} from '../constants/config';
import { THEME } from '../constants/theme';
import { AirwayCanvas } from '../components/AirwayCanvas';
import { HintPill } from '../components/HintPill';
import { PauseOverlay } from '../components/PauseOverlay';
import { RoundIconButton } from '../components/RoundIconButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SlipstreamBar } from '../components/SlipstreamBar';
import { WingPips } from '../components/WingPips';
import { formatPoints } from '../game/scoring';
import type { ChallengeRoute } from '../game/routes';
import type { SessionMode, SessionSummary } from '../game/session';
import { perksFromStamps } from '../game/stamps';
import { useFlightSession } from '../hooks/useFlightSession';
import { useCareerSelector } from '../hooks/usePersistentState';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type GameScreenProps = {
  mode: SessionMode;
  route?: ChallengeRoute;
  seedSalt: number;
  onGameOver: (summary: SessionSummary) => void;
  onExit: () => void;
};

function BarButton({
  label,
  onPress,
  disabled,
  wide,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  wide?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = useCallback(
    (to: number) => {
      Animated.spring(scale, {
        toValue: to,
        useNativeDriver: true,
        ...THEME.animation.press,
      }).start();
    },
    [scale],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={() => press(0.94)}
      onPressOut={() => press(1)}
      style={[
        wide ? styles.landPress : styles.sidePress,
        disabled ? styles.disabled : null,
      ]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          wide ? styles.landFill : styles.sideFill,
          { transform: [{ scale }] },
        ]}>
        <Image
          source={wide ? assets.buttonRect : assets.buttonRound}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: wide ? THEME.radius.lg : 32, opacity: 0.4 },
          ]}
          resizeMode="cover"
        />
        {wide ? (
          <LinearGradient
            colors={[...THEME.gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.92 }]}
          />
        ) : null}
        <View style={styles.barRow}>
          <Text style={wide ? styles.landText : styles.sideText}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function GameScreen({
  mode,
  route,
  seedSalt,
  onGameOver,
  onExit,
}: GameScreenProps) {
  const settings = useCareerSelector(r => r.settings);
  const stamps = useCareerSelector(r => r.stamps);
  const perks = React.useMemo(() => perksFromStamps(stamps), [stamps]);
  const factors = DIFFICULTY[settings.difficulty];

  const [areaH, setAreaH] = useState(0);
  const [paused, setPaused] = useState(false);
  const laneH =
    areaH > 0 ? Math.floor((areaH - 2 * BOARD_FRAME) / LANES) : 0;

  const session = useFlightSession({
    mode,
    route,
    perks,
    speedFactor: factors.speed,
    turbFactor: 1 / factors.turb,
    laneH,
    seedSalt,
    paused,
    onFinish: onGameOver,
  });

  const entry = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [entry]);

  const scorePulse = useRef(new Animated.Value(1)).current;
  const lastPop = useRef(session.popKey);
  useEffect(() => {
    if (session.popKey === lastPop.current) {
      return;
    }
    lastPop.current = session.popKey;
    Animated.sequence([
      Animated.timing(scorePulse, {
        toValue: 1.12,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scorePulse, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scorePulse, session.popKey]);

  // Short haptic on a turbulence hit (declares VIBRATE in AndroidManifest.xml).
  const lastShake = useRef(session.shakeKey);
  useEffect(() => {
    if (session.shakeKey === lastShake.current) {
      return;
    }
    lastShake.current = session.shakeKey;
    try {
      Vibration.vibrate(35);
    } catch (e) {
      // haptics are a nicety, never a crash path
    }
  }, [session.shakeKey]);

  const sides = settings.controlScheme === 'sides';
  const hintText = sides
    ? 'TAP THE TOP OR BOTTOM HALF OF THE SKY TO CHANGE LANE'
    : 'TAP LEFT OR RIGHT TO CHANGE LANE - TAP LAND ON THE RING';

  const landEnabled = session.phase === 'landing' && !session.landRequested;

  const handleHome = useCallback(() => {
    session.abandon();
    onExit();
  }, [onExit, session]);

  return (
    <ScreenBackground colors={THEME.gradients.game}>
      <ScreenHeader
        title={`LEG ${Math.min(session.legIndex + 1, session.legs)} / ${session.legs}`}
        centerExtra={<WingPips intact={session.wings} />}
        leftSlot={
          <RoundIconButton
            source={assets.iconHome}
            size={44}
            iconSize={24}
            accessibilityLabel="HOME"
            onPress={handleHome}
            testID="btn-home"
          />
        }
        rightSlot={
          <View style={styles.rightGroup}>
            <View style={styles.scoreCol}>
              <Animated.Text
                style={[styles.score, { transform: [{ scale: scorePulse }] }]}
                numberOfLines={1}>
                {formatPoints(session.score)}
              </Animated.Text>
              <Text style={styles.scoreCaption}>SCORE</Text>
              <SlipstreamBar
                value={session.slip}
                multiplier={session.multiplier}
                width={60}
              />
            </View>
            <RoundIconButton
              source={assets.iconPause}
              size={44}
              iconSize={24}
              accessibilityLabel="PAUSE"
              onPress={() => setPaused(true)}
              testID="btn-pause"
            />
          </View>
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[styles.area, { transform: [{ scale: entry }] }]}>
        <AirwayCanvas
          entities={session.entities}
          lane={session.lane}
          laneH={laneH}
          height={areaH}
          phase={session.phase}
          invulnerable={session.invulnerable}
          shakeKey={session.shakeKey}
          reducedMotion={settings.reducedMotion}
          laneGuides={settings.laneGuides}
          zoneW={session.safeZoneW}
          cycleMs={factors.cycle}
          landRequested={session.landRequested}
          tier={session.lastTier}
          onResolve={session.resolveLanding}
          onLayoutHeight={h => {
            const next = Math.round(h);
            setAreaH(prev => (Math.abs(prev - next) < 2 ? prev : next));
          }}
        />
        {sides ? (
          <View pointerEvents="box-none" style={styles.sidesLayer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="CLIMB"
              style={styles.halfTop}
              onPress={() => session.changeLane(-1)}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="DESCEND"
              style={styles.halfBottom}
              onPress={() => session.changeLane(1)}
            />
          </View>
        ) : null}
      </Animated.View>

      <HintPill
        text={hintText}
        visible={session.hintVisible && !paused}
        bottom={BAR_BOTTOM + BAR_H + 16}
      />

      <View style={styles.bar}>
        {sides ? (
          <View style={styles.spacer} />
        ) : (
          <BarButton label="LEFT" onPress={() => session.changeLane(-1)} />
        )}
        <BarButton
          wide
          label="LAND"
          disabled={!landEnabled}
          onPress={session.requestLand}
        />
        {sides ? (
          <View style={styles.spacer} />
        ) : (
          <BarButton label="RIGHT" onPress={() => session.changeLane(1)} />
        )}
      </View>

      <PauseOverlay
        visible={paused}
        legLabel={`LEG ${Math.min(session.legIndex + 1, session.legs)} OF ${session.legs}`}
        onResume={() => setPaused(false)}
        onMenu={handleHome}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.accent.secondary,
    fontVariant: ['tabular-nums'],
  },
  scoreCaption: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: THEME.colors.text.muted,
  },
  area: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: NO_SPAWN_STRIP,
  },
  sidesLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    bottom: NO_SPAWN_STRIP,
  },
  halfTop: {
    flex: 1,
    width: '100%',
  },
  halfBottom: {
    flex: 1,
    width: '100%',
  },
  bar: {
    position: 'absolute',
    bottom: BAR_BOTTOM,
    alignSelf: 'center',
    width: AIRWAY_W,
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderRadius: THEME.radius.xl,
    backgroundColor: 'rgba(24,24,28,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...THEME.shadows.bar,
  },
  spacer: {
    width: 64,
    height: 64,
  },
  sidePress: {
    width: 64,
    height: 64,
  },
  sideFill: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  landPress: {
    width: 150,
    height: 64,
  },
  landFill: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sideText: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text.secondary,
  },
  landText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default GameScreen;
