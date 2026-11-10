import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleHelp } from 'lucide-react-native';
import { assets } from '../assets';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { Stamp } from '../game/stamps';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const SIZE = 72;

export type StampTileProps = {
  stamp: Stamp;
  owned: boolean;
  selected: boolean;
  onPress: (stamp: Stamp) => void;
};

export function StampTile({ stamp, owned, selected, onPress }: StampTileProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={owned ? stamp.name : 'LOCKED STAMP'}
      hitSlop={HIT}
      disabled={!owned}
      onPress={() => onPress(stamp)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tile,
          owned ? styles.owned : styles.locked,
          selected ? styles.selected : null,
          { transform: [{ scale }] },
        ]}>
        <Image
          source={assets.sprite2}
          style={[styles.img, owned ? null : styles.imgDim]}
          resizeMode="contain"
        />
        {owned ? null : (
          <View style={styles.scrim}>
            <CircleHelp
              size={22}
              strokeWidth={1.5}
              color={THEME.colors.text.muted}
            />
          </View>
        )}
      </Animated.View>
      <Text style={styles.caption} numberOfLines={1}>
        {owned ? stamp.name : 'LOCKED'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: SIZE,
    height: SIZE + 20,
    alignItems: 'center',
  },
  tile: {
    width: SIZE,
    height: SIZE,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
  },
  owned: {
    borderColor: 'rgba(244,166,42,0.75)',
  },
  locked: {
    borderColor: THEME.colors.ui.border,
  },
  selected: {
    borderColor: THEME.colors.accent.primary,
  },
  img: {
    width: 46,
    height: 46,
  },
  imgDim: {
    opacity: 0.14,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,20,0.6)',
  },
  caption: {
    marginTop: 4,
    width: SIZE,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: THEME.colors.text.muted,
  },
});

export default StampTile;
