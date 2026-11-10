import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

export type SlipstreamBarProps = {
  value: number;
  multiplier: number;
  width?: number;
};

/** The tailwind meter: pickups feed it, a turbulence hit empties it. */
export function SlipstreamBar({ value, multiplier, width = 96 }: SlipstreamBarProps) {
  const pct = Math.min(1, (value % 5) / 5 + (multiplier >= 3 ? 1 : 0));
  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { width }]}>
        <View
          style={[
            styles.fill,
            { width: Math.max(4, Math.round(width * pct)) },
          ]}
        />
      </View>
      <Text style={styles.tag}>{`x${multiplier.toFixed(1)}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.ui.track,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.accent.secondary,
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: THEME.colors.accent.secondary,
    fontVariant: ['tabular-nums'],
  },
});

export default SlipstreamBar;
