import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { THEME } from '../constants/theme';

export type HintPillProps = {
  text: string;
  visible: boolean;
  bottom: number;
};

/** Names the GESTURE and its RESULT, and stays long enough to land in a frame. */
export function HintPill({ text, visible, bottom }: HintPillProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pill, { bottom, opacity }]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: THEME.colors.text.secondary,
  },
});

export default HintPill;
