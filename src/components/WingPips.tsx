import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WINGS } from '../constants/config';
import { THEME } from '../constants/theme';

/** Wing integrity, drawn with Views — never a chevron glyph (tofu on Android). */
export function WingPips({ intact }: { intact: number }) {
  const pips = [];
  for (let i = 0; i < WINGS; i++) {
    const alive = i < intact;
    pips.push(
      <View
        key={`pip${i}`}
        style={[styles.pip, alive ? styles.alive : styles.lost]}
      />,
    );
  }
  return <View style={styles.row}>{pips}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  alive: {
    backgroundColor: THEME.colors.accent.primary,
  },
  lost: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});

export default WingPips;
