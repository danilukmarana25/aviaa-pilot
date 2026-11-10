import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { THEME } from '../constants/theme';

export type AppShellProps<K extends string> = {
  screenKey: K;
  reducedMotion: boolean;
  renderScreen: (key: K) => React.ReactNode;
};

/**
 * Owns the route cross-fade. Transitions are animated, never an instant swap.
 * pointerEvents="box-none" so the fading wrapper never swallows a tap.
 */
export function AppShell<K extends string>({
  screenKey,
  reducedMotion,
  renderScreen,
}: AppShellProps<K>) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayKey, setDisplayKey] = useState<K>(screenKey);
  const targetRef = useRef<K>(screenKey);

  useEffect(() => {
    targetRef.current = screenKey;
    if (displayKey === screenKey) {
      return;
    }
    const duration = reducedMotion
      ? THEME.animation.fadeReduced
      : THEME.animation.fade;
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      setDisplayKey(targetRef.current);
      Animated.timing(opacity, {
        toValue: 1,
        duration: finished ? duration : 0,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  return (
    <View style={styles.root}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity }]}>
        {renderScreen(displayKey)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.bg.primary,
  },
  fill: {
    flex: 1,
  },
});

export default AppShell;
