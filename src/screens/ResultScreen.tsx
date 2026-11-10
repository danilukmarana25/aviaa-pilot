import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Album, House, RotateCw } from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatRow } from '../components/StatRow';
import { accuracyPercent, formatPoints, xpForScore } from '../game/scoring';
import { headline, subline, type SessionSummary } from '../game/session';
import { STAMPS } from '../game/stamps';
import { useReducedMotion } from '../hooks/useSettings';

export type ResultScreenProps = {
  summary: SessionSummary;
  onAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
};

function useCountUp(target: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const start = Date.now();
    let raf = 0;
    let alive = true;
    const step = () => {
      if (!alive) {
        return;
      }
      const p = Math.min(1, (Date.now() - start) / 600);
      setValue(Math.round(target * p));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [reduced, target]);

  return value;
}

export function ResultScreen({
  summary,
  onAgain,
  onMenu,
  onCollection,
}: ResultScreenProps) {
  const reduced = useReducedMotion();
  const shown = useCountUp(summary.score, reduced);
  const rings = useRef(new Animated.Value(0)).current;
  const won = summary.completed;

  useEffect(() => {
    if (reduced || !won) {
      rings.setValue(won ? 1 : 0);
      return;
    }
    const anim = Animated.timing(rings, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [reduced, rings, won]);

  const accent = won
    ? THEME.colors.accent.secondary
    : THEME.colors.accent.primary;

  const newStamps = summary.newStamps
    .map(id => STAMPS.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 5);

  const xp = xpForScore(summary.score);
  const accuracy = accuracyPercent(summary.tiers);
  const stampTotal =
    summary.tiers.gold + summary.tiers.silver + summary.tiers.bronze;

  const ringScale = rings.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const ringOpacity = rings.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <ScreenBackground
      colors={THEME.gradients.result}
      decor={
        <View
          style={[
            styles.blob,
            {
              backgroundColor: won
                ? 'rgba(244,166,42,0.12)'
                : 'rgba(230,57,70,0.12)',
            },
          ]}
        />
      }>
      <ScreenHeader
        title="DEBRIEF"
        subtitle={summary.routeName}
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: accent }]}>
          {headline(summary)}
        </Text>
        <Text style={styles.subline}>{subline(summary)}</Text>

        <View style={styles.scoreBlock}>
          {won ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
          ) : (
            <View pointerEvents="none" style={styles.sweep} />
          )}
          <Text style={styles.score}>{formatPoints(shown)}</Text>
          <Text style={styles.best}>{`BEST ${formatPoints(
            Math.max(summary.bestBefore, summary.score),
          )}`}</Text>
          {summary.isNewBest ? (
            <View style={styles.newBest}>
              <Text style={styles.newBestText}>NEW BEST</Text>
            </View>
          ) : null}
        </View>

        <StatRow
          items={[
            {
              key: 'stamps',
              value: summary.newStamps.length,
              label: 'STAMPS',
              accent: THEME.colors.accent.secondary,
            },
            {
              key: 'accuracy',
              value: accuracy,
              label: 'ACCURACY',
              suffix: '%',
              accent: '#55EFC4',
            },
            {
              key: 'xp',
              value: xp,
              label: 'XP',
              accent: THEME.colors.accent.primary,
            },
          ]}
        />

        <View style={styles.stampPanel}>
          <Text style={styles.panelTitle}>ROUTE STAMPS</Text>
          {newStamps.length > 0 ? (
            <View style={styles.stampStrip}>
              {newStamps.map(stamp => (
                <View key={stamp!.id} style={styles.stampCell}>
                  <Image
                    source={assets.sprite2}
                    style={styles.stampImg}
                    resizeMode="contain"
                  />
                  <Text style={styles.stampName} numberOfLines={1}>
                    {stamp!.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState text="NO NEW STAMPS THIS ROUTE" />
          )}
        </View>

        {stampTotal > 0 ? (
          <Text style={styles.landingLine}>
            {`GOLD ${summary.tiers.gold} . SILVER ${summary.tiers.silver} . BRONZE ${summary.tiers.bronze} . MISS ${summary.tiers.miss}`}
          </Text>
        ) : null}

        <Text style={styles.hint}>HOW TO FLY - TAP LAND ON THE RING CENTRE</Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="FLY AGAIN"
            Icon={RotateCw}
            height={56}
            onPress={onAgain}
            testID="btn-fly-again"
          />
          <SecondaryButton label="MENU" Icon={House} height={48} onPress={onMenu} />
          {summary.newStamps.length > 0 ? (
            <SecondaryButton
              label="COLLECTION"
              Icon={Album}
              height={48}
              onPress={onCollection}
            />
          ) : null}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 14,
  },
  headline: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subline: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9AA8',
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  ring: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: 'rgba(244,166,42,0.5)',
  },
  sweep: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(230,57,70,0.6)',
  },
  score: {
    fontSize: 44,
    fontWeight: '800',
    color: THEME.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  best: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: THEME.colors.text.muted,
    fontVariant: ['tabular-nums'],
  },
  newBest: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.pill,
    backgroundColor: 'rgba(244,166,42,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,166,42,0.7)',
  },
  newBestText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: THEME.colors.accent.secondary,
  },
  stampPanel: {
    borderRadius: THEME.radius.lg,
    backgroundColor: 'rgba(24,24,28,0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    padding: 14,
    gap: 10,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.muted,
  },
  stampStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  stampCell: {
    width: 56,
    alignItems: 'center',
    gap: 4,
  },
  stampImg: {
    width: 40,
    height: 40,
  },
  stampName: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.text.muted,
    textAlign: 'center',
  },
  landingLine: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.text.secondary,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: THEME.colors.text.muted,
    marginBottom: 4,
  },
  actions: {
    gap: 12,
  },
});

export default ResultScreen;
