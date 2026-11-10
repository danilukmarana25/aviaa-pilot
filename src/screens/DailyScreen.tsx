import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Plane } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatRow } from '../components/StatRow';
import {
  callSign,
  dateKey,
  hoursUntilTomorrow,
  rollDaily,
} from '../game/daily';
import { formatPoints } from '../game/scoring';
import { useCareerSelector } from '../hooks/usePersistentState';

export type DailyScreenProps = {
  onStartDaily: () => void;
  onMenu: () => void;
};

export function DailyScreen({ onStartDaily, onMenu }: DailyScreenProps) {
  const stored = useCareerSelector(r => r.daily);
  const now = new Date();
  const today = dateKey(now);
  const daily = rollDaily(stored, today);
  const sign = callSign(today);

  return (
    <ScreenBackground colors={THEME.gradients.panel}>
      <ScreenHeader
        title="DAILY"
        subtitle={today}
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <CalendarDays
              size={22}
              strokeWidth={1.5}
              color={THEME.colors.accent.secondary}
            />
            <Text style={styles.sign}>{sign}</Text>
          </View>
          <Text style={styles.legs}>3 LEGS</Text>
          <Text style={styles.rule}>
            ONE ATTEMPT PER DAY - SAME AIRWAY FOR EVERY PILOT
          </Text>

          {daily.used ? (
            <View style={styles.doneBlock}>
              <Text style={styles.doneLine}>
                {`TODAY ${formatPoints(daily.score)}`}
              </Text>
              <View style={styles.lockedTile}>
                <Text style={styles.lockedText}>
                  {`COME BACK TOMORROW - ${hoursUntilTomorrow(now)} H LEFT`}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.ctaBlock}>
              <Text style={styles.hint}>FLY IT ONCE - THE SEED IS FIXED</Text>
              <PrimaryButton
                label="START DAILY"
                Icon={Plane}
                height={56}
                onPress={onStartDaily}
                testID="btn-start-daily"
              />
            </View>
          )}
        </View>

        <StatRow
          items={[
            {
              key: 'streak',
              value: daily.streak,
              label: 'STREAK',
              accent: THEME.colors.accent.primary,
            },
            {
              key: 'score',
              value: daily.score,
              label: 'TODAY',
              accent: THEME.colors.accent.secondary,
            },
          ]}
        />

        <View style={styles.streakPanel}>
          <Text style={styles.panelTitle}>LAST 7 DAYS</Text>
          <View style={styles.streakRow}>
            {daily.history.map((on, i) => (
              <View
                key={`day${i}`}
                style={[styles.streakCell, on ? styles.streakOn : null]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  card: {
    padding: 18,
    gap: 8,
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sign: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    color: THEME.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  legs: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.accent.secondary,
  },
  rule: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: THEME.colors.text.secondary,
    marginBottom: 6,
  },
  ctaBlock: {
    gap: 10,
  },
  hint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: THEME.colors.text.muted,
  },
  doneBlock: {
    gap: 10,
  },
  doneLine: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: THEME.colors.accent.secondary,
    fontVariant: ['tabular-nums'],
  },
  lockedTile: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    opacity: 0.7,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.text.muted,
  },
  streakPanel: {
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
  streakRow: {
    flexDirection: 'row',
    gap: 8,
  },
  streakCell: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    backgroundColor: THEME.colors.ui.track,
  },
  streakOn: {
    backgroundColor: THEME.colors.accent.secondary,
  },
});

export default DailyScreen;
