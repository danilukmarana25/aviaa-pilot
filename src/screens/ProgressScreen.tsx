import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TrendingUp } from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatRow } from '../components/StatRow';
import {
  accuracyPercent,
  formatPoints,
  RANKS,
  xpInRank,
} from '../game/scoring';
import { STAMPS } from '../game/stamps';
import { useCareerSelector } from '../hooks/usePersistentState';

export type ProgressScreenProps = {
  onMenu: () => void;
};

function HistogramBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={styles.histRow}>
      <Text style={styles.histLabel}>{label}</Text>
      <View style={styles.histTrack}>
        <View
          style={[
            styles.histFill,
            { backgroundColor: color, width: `${Math.max(2, pct * 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.histValue}>{String(value)}</Text>
    </View>
  );
}

export function ProgressScreen({ onMenu }: ProgressScreenProps) {
  const flights = useCareerSelector(r => r.flights);
  const bestScore = useCareerSelector(r => r.bestScore);
  const xp = useCareerSelector(r => r.xp);
  const rankIndex = useCareerSelector(r => r.rankIndex);
  const stamps = useCareerSelector(r => r.stamps);
  const tiers = useCareerSelector(r => r.tiers);

  const rankXp = xpInRank(xp);
  const pct = Math.max(0, Math.min(1, rankXp.current / rankXp.needed));
  const maxTier = Math.max(1, tiers.gold, tiers.silver, tiers.bronze);
  const accuracy = accuracyPercent(tiers);

  return (
    <ScreenBackground colors={THEME.gradients.panel}>
      <ScreenHeader
        title="PROGRESS"
        subtitle="PILOT CAREER"
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.rankCard}>
          <Image
            source={assets.sprite5}
            style={styles.rankIcon}
            resizeMode="contain"
          />
          <View style={styles.rankBody}>
            <Text style={styles.rankName}>{RANKS[rankIndex]}</Text>
            <View style={styles.xpTrack}>
              <LinearGradient
                colors={[...THEME.gradients.reward]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.xpFill, { width: `${Math.max(2, pct * 100)}%` }]}
              />
            </View>
            <Text style={styles.xpLine}>
              {`${rankXp.current} / ${rankXp.needed} XP`}
            </Text>
          </View>
        </View>

        {flights > 0 ? (
          <View style={styles.grid}>
            <StatRow
              items={[
                {
                  key: 'flights',
                  value: flights,
                  label: 'FLIGHTS',
                  accent: THEME.colors.accent.secondary,
                },
                {
                  key: 'best',
                  value: formatPoints(bestScore),
                  label: 'BEST SCORE',
                  accent: THEME.colors.accent.primary,
                },
              ]}
            />
            <StatRow
              items={[
                {
                  key: 'stamps',
                  value: `${stamps.length}/${STAMPS.length}`,
                  label: 'STAMPS',
                  accent: THEME.colors.accent.secondary,
                },
                {
                  key: 'gold',
                  value: tiers.gold,
                  label: 'GOLD LANDINGS',
                  accent: '#F4A62A',
                },
                {
                  key: 'silver',
                  value: tiers.silver,
                  label: 'SILVER',
                  accent: '#C9C9D2',
                },
              ]}
            />
            <StatRow
              items={[
                {
                  key: 'accuracy',
                  value: accuracy,
                  suffix: '%',
                  label: 'ACCURACY',
                  accent: '#55EFC4',
                },
                {
                  key: 'xp',
                  value: xp,
                  label: 'TOTAL XP',
                  accent: THEME.colors.accent.primary,
                },
              ]}
            />
          </View>
        ) : (
          <EmptyState
            Icon={TrendingUp}
            text="NO FLIGHTS LOGGED YET - START A FLIGHT FROM HOME"
          />
        )}

        <View style={styles.histPanel}>
          <Text style={styles.panelTitle}>LANDING HISTOGRAM</Text>
          <HistogramBar
            label="GOLD"
            value={tiers.gold}
            max={maxTier}
            color="#F4A62A"
          />
          <HistogramBar
            label="SILVER"
            value={tiers.silver}
            max={maxTier}
            color="#C9C9D2"
          />
          <HistogramBar
            label="BRONZE"
            value={tiers.bronze}
            max={maxTier}
            color="#B9763C"
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  rankIcon: {
    width: 56,
    height: 56,
  },
  rankBody: {
    flex: 1,
    gap: 8,
  },
  rankName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.primary,
  },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.ui.track,
    overflow: 'hidden',
  },
  xpFill: {
    height: 8,
    borderRadius: 4,
  },
  xpLine: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.text.muted,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    gap: 12,
  },
  histPanel: {
    padding: 14,
    gap: 10,
    borderRadius: THEME.radius.lg,
    backgroundColor: 'rgba(24,24,28,0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.muted,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  histLabel: {
    width: 58,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.text.secondary,
  },
  histTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.ui.track,
    overflow: 'hidden',
  },
  histFill: {
    height: 10,
    borderRadius: 5,
  },
  histValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});

export default ProgressScreen;
