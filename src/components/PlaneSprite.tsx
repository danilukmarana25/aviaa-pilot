import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import { assets } from '../assets';
import { BOARD_FRAME, PLANE_H, PLANE_W, PLANE_X } from '../constants/config';
import { THEME } from '../constants/theme';

export type PlaneSpriteProps = {
  lane: number;
  laneH: number;
  invulnerable: boolean;
  reducedMotion: boolean;
};

/** sprite_1 is declared facing RIGHT, nose level — the code is written from that. */
export function PlaneSprite({
  lane,
  laneH,
  invulnerable,
  reducedMotion,
}: PlaneSpriteProps) {
  const targetY = BOARD_FRAME + lane * laneH + (laneH - PLANE_H) / 2;
  const y = useRef(new Animated.Value(targetY)).current;
  const bank = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const prevLane = useRef(lane);

  useEffect(() => {
    const delta = lane - prevLane.current;
    prevLane.current = lane;
    Animated.spring(y, {
      toValue: targetY,
      useNativeDriver: true,
      ...THEME.animation.lane,
    }).start();
    if (delta !== 0) {
      bank.setValue(delta > 0 ? 1 : -1);
      Animated.spring(bank, {
        toValue: 0,
        useNativeDriver: true,
        ...THEME.animation.lane,
      }).start();
    }
  }, [bank, lane, targetY, y]);

  useEffect(() => {
    if (!invulnerable || reducedMotion) {
      blink.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.25,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      blink.setValue(1);
    };
  }, [blink, invulnerable, reducedMotion]);

  const rotate = bank.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.plane,
        { opacity: blink, transform: [{ translateY: y }, { rotate }] },
      ]}>
      <Image source={assets.sprite1} style={styles.img} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  plane: {
    position: 'absolute',
    left: PLANE_X,
    top: 0,
    width: PLANE_W,
    height: PLANE_H,
  },
  img: {
    width: PLANE_W,
    height: PLANE_H,
  },
});

export default PlaneSprite;
