import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { House, Play } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

export type PauseOverlayProps = {
  visible: boolean;
  legLabel: string;
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({
  visible,
  legLabel,
  onResume,
  onMenu,
}: PauseOverlayProps) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.scrim}>
      <View style={styles.card}>
        <Text style={styles.title}>FLIGHT HELD</Text>
        <Text style={styles.sub}>{legLabel}</Text>
        <View style={styles.actions}>
          <PrimaryButton label="RESUME" Icon={Play} onPress={onResume} height={56} />
          <SecondaryButton label="MENU" Icon={House} onPress={onMenu} height={48} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,8,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  card: {
    width: '100%',
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    color: THEME.colors.text.primary,
  },
  sub: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: THEME.colors.text.muted,
    marginBottom: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});

export default PauseOverlay;
