import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Album,
  CalendarDays,
  Plane,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { BentoTile } from '../components/BentoTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatPoints, RANKS } from '../game/scoring';
import { STAMPS } from '../game/stamps';
import { dateKey, rollDaily } from '../game/daily';
import { useCareerSelector } from '../hooks/usePersistentState';
import { useReducedMotion } from '../hooks/useSettings';

export type MenuScreenProps = {
  onPlay: () => void;
  onChallenge: () => void;
  onDaily: () => void;
  onProgress: () => void;
  onCollection: () => void;
  onSettings: () => void;
};

function useStagger(count: number, reduced: boolean) {
  const values = useMemo(
    () => Array.from({ length: count }, () => new Animated.Value(reduced ? 1 : 0)),
    [count, reduced],
  );

  useEffect(() => {
    if (reduced) {
      values.forEach(v => v.setValue(1));
      return;
    }
    const anim = Animated.stagger(
      60,
      values.map(v =>
        Animated.timing(v, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [reduced, values]);

  return values;
}

function Blobs() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.blobRed} />
      <View style={styles.blobAmber} />
    </View>
  );
}

export function MenuScreen({
  onPlay,
  onChallenge,
  onDaily,
  onProgress,
  onCollection,
  onSettings,
}: MenuScreenProps) {
  const flights = useCareerSelector(r => r.flights);
  const bestScore = useCareerSelector(r => r.bestScore);
  const stampCount = useCareerSelector(r => r.stamps.length);
  const rankIndex = useCareerSelector(r => r.rankIndex);
  const daily = useCareerSelector(r => r.daily);
  const reduced = useReducedMotion();

  const today = dateKey(new Date());
  const dailyUsed = rollDaily(daily, today).used;

  const steps = useStagger(5, reduced);
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      float.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [float, reduced]);

  const planeY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const anim = (i: number) => ({
    opacity: steps[i],
    transform: [
      {
        translateY: steps[i].interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  return (
    <ScreenBackground
      colors={THEME.gradients.menu}
      angle="diagonal"
      decor={<Blobs />}>
      <ScreenHeader
        bare
        title=""
        leftSlot={
          <View style={styles.brand}>
            <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>AVIAA PILOT</Text>
          </View>
        }
        rightSlot={
          <View style={styles.rankPill}>
            <View style={styles.rankBadge}>
              <Image
                source={assets.buttonRound}
                style={styles.rankPlate}
                resizeMode="cover"
              />
              <Image
                source={assets.sprite5}
                style={styles.rankIcon}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.rankName}>{RANKS[rankIndex]}</Text>
              <Text style={styles.rankLevel}>{`LV ${rankIndex + 1}`}</Text>
            </View>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Animated.View pointerEvents="box-none" style={anim(0)}>
          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(230,57,70,0.16)', 'rgba(31,31,36,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Animated.Image
              source={assets.sprite1}
              resizeMode="contain"
              style={[styles.heroPlane, { transform: [{ translateY: planeY }] }]}
            />
            <Text style={styles.heroKicker}>FREE FLIGHT</Text>
            <Text style={styles.heroLine}>3 LEGS - OPEN AIRWAY</Text>
            <View style={styles.heroCta}>
              <PrimaryButton
                label="START FLIGHT"
                Icon={Plane}
                height={60}
                onPress={onPlay}
                testID="btn-start-flight"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={anim(1)}>
          {flights > 0 ? (
            <View style={styles.row}>
              <View style={styles.cell}>
                <BentoTile
                  title={formatPoints(bestScore)}
                  caption="BEST SCORE"
                  height={96}
                  accent={THEME.colors.accent.secondary}
                />
              </View>
              <View style={styles.cell}>
                <BentoTile
                  title={`${stampCount}/${STAMPS.length}`}
                  caption="STAMPS"
                  height={96}
                  accent={THEME.colors.accent.primary}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyTile}>
              <Text style={styles.emptyText}>
                FIRST FLIGHT - COLLECT 4 STAMPS TO OPEN THE ALBUM
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={anim(2)}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <BentoTile
                title="CHALLENGE"
                caption="5-LEG ROUTES"
                Icon={Target}
                height={84}
                accent={THEME.colors.accent.primary}
                onPress={onChallenge}
                testID="btn-challenge"
              />
            </View>
            <View style={styles.cell}>
              <BentoTile
                title="DAILY"
                caption={dailyUsed ? 'FLOWN TODAY' : 'TODAYS ROUTE'}
                Icon={CalendarDays}
                height={84}
                accent={THEME.colors.accent.secondary}
                onPress={onDaily}
                testID="btn-daily"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={anim(3)}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <BentoTile
                title="PROGRESS"
                Icon={TrendingUp}
                height={72}
                onPress={onProgress}
                testID="btn-progress"
              />
            </View>
            <View style={styles.cell}>
              <BentoTile
                title="COLLECTION"
                Icon={Album}
                height={72}
                onPress={onCollection}
                testID="btn-collection"
              />
            </View>
            <View style={styles.cell}>
              <BentoTile
                title="SETTINGS"
                Icon={SettingsIcon}
                height={72}
                onPress={onSettings}
                testID="btn-settings"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={anim(4)}>
          <Text style={styles.footer}>
            OFFLINE PILOT CAREER - PILOT POINTS ONLY, NO REAL MONEY
          </Text>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  blobRed: {
    position: 'absolute',
    top: -80,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(230,57,70,0.10)',
  },
  blobAmber: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(244,166,42,0.07)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.primary,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.glassLine,
  },
  rankPlate: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  rankIcon: {
    width: 26,
    height: 26,
  },
  rankName: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: THEME.colors.accent.secondary,
  },
  rankLevel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#9A9AA8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12,
  },
  hero: {
    height: 196,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingTop: 16,
    justifyContent: 'flex-start',
  },
  heroPlane: {
    position: 'absolute',
    right: 14,
    bottom: 58,
    width: 150,
    height: 96,
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#9A9AA8',
  },
  heroLine: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '500',
    color: THEME.colors.text.secondary,
  },
  heroCta: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
  },
  emptyTile: {
    minHeight: 96,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#9A9AA8',
  },
  footer: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.text.muted,
  },
});

export default MenuScreen;
