import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { THEME } from '../constants/theme';

/**
 * Press feedback: the Pressable stays the PARENT and drives this scale,
 * the Animated.View is the CHILD. Native driver on transform only.
 */
export function usePressScale(to = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      ...THEME.animation.press,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...THEME.animation.press,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

export default usePressScale;
