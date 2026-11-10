import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SettingRow } from '../components/SettingRow';
import type { ControlScheme, DifficultyKey } from '../constants/config';
import { useCareerActions } from '../hooks/usePersistentState';
import { useSettings, useSettingsActions } from '../hooks/useSettings';

export type SettingsScreenProps = {
  onMenu: () => void;
};

const CONTROL_OPTIONS = [
  { value: 'buttons', label: 'BUTTON BAR' },
  { value: 'sides', label: 'TAP SIDES' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'CRUISE', label: 'CRUISE' },
  { value: 'STANDARD', label: 'STANDARD' },
  { value: 'STORM', label: 'STORM' },
];

export function SettingsScreen({ onMenu }: SettingsScreenProps) {
  const settings = useSettings();
  const { setControlScheme, setDifficulty, setLaneGuides, setReducedMotion } =
    useSettingsActions();
  const { reset } = useCareerActions();
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), 4000);
      return;
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setConfirming(false);
    reset();
    onMenu();
  }, [confirming, onMenu, reset]);

  return (
    <ScreenBackground colors={THEME.gradients.panel}>
      <ScreenHeader
        title="SETTINGS"
        subtitle="FLIGHT OPTIONS"
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <SettingRow
            kind="segment"
            label="CONTROL SCHEME"
            hint="TAP SIDES hides LEFT and RIGHT and uses the sky halves"
            value={settings.controlScheme}
            options={CONTROL_OPTIONS}
            onChange={v => setControlScheme(v as ControlScheme)}
          />
          <SettingRow
            kind="segment"
            label="DIFFICULTY"
            hint="Scroll speed, turbulence spacing and ring speed"
            value={settings.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={v => setDifficulty(v as DifficultyKey)}
          />
          <SettingRow
            kind="switch"
            label="LANE GUIDES"
            hint="Dashed lane separators and the landing ruler ticks"
            value={settings.laneGuides}
            onChange={setLaneGuides}
          />
          <SettingRow
            kind="switch"
            label="REDUCED MOTION"
            hint="Freezes parallax and breathing loops, shortens transitions"
            value={settings.reducedMotion}
            onChange={setReducedMotion}
          />
        </View>

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>RESET PROGRESS</Text>
          <Text style={styles.dangerLine}>
            Wipes ranks, stamps, route bests and the daily record.
          </Text>
          <SecondaryButton
            label={confirming ? 'TAP AGAIN TO CONFIRM' : 'RESET PROGRESS'}
            Icon={Trash2}
            tone="danger"
            height={48}
            onPress={handleReset}
          />
        </View>

        <Text style={styles.note}>
          NO AUDIO IN THIS APP - A VOLUME ROW WOULD BE A DEAD CONTROL
        </Text>
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
    gap: 16,
  },
  group: {
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  danger: {
    padding: 14,
    gap: 10,
    borderRadius: THEME.radius.lg,
    backgroundColor: 'rgba(24,24,28,0.72)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.text.primary,
  },
  dangerLine: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.colors.text.muted,
  },
  note: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.text.muted,
  },
});

export default SettingsScreen;
