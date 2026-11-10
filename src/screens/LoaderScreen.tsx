import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { LOADER_DURATION_MS, SCREEN_H, SCREEN_W } from '../constants/config';
import { THEME } from '../constants/theme';
import { ScreenBackground } from '../components/ScreenBackground';

const BAR_W = 200;

export type LoaderScreenProps = {
  onDone: () => void;
};

function Decor() {
  const dots = useMemo(() => {
    // dots stay out of the 36%-76% band that holds the disc, title and bar
    const out: { left: number; top: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const band = i % 2 === 0 ? 0.3 : 0.24;
      const offset = i % 2 === 0 ? 0.04 : 0.76;
      out.push({
        left: (((i * 97) % 100) / 100) * (SCREEN_W - 8) + 4,
        top: ((((i * 173) % 100) / 100) * band + offset) * SCREEN_H,
      });
    }
    return out;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* altitude rules sit clear of the centred brand block — never across letters */}
      <View style={[styles.rule, { top: SCREEN_H * 0.14 }]}>
        <View style={styles.ruleTick} />
      </View>
      <View style={[styles.rule, { top: SCREEN_H * 0.86 }]}>
        <View style={styles.ruleTick} />
      </View>
      {dots.map((d, i) => (
        <View key={`dot${i}`} style={[styles.dot, { left: d.left, top: d.top }]} />
      ))}
    </View>
  );
}

/**
 * Brand card, not a menu duplicate: no PLAY button, no stat chips, no touch
 * handler. One timer holds it for exactly LOADER_DURATION_MS and then moves on.
 */
export function LoaderScreen({ onDone }: LoaderScreenProps) {
  const discScale = useRef(new Animated.Value(0.82)).current;
  const discOpacity = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(12)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => {
      doneRef.current();
    }, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(discScale, {
        toValue: 1,
        useNativeDriver: true,
        ...THEME.animation.disc,
      }),
      Animated.timing(discOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();

    const titleAnim = Animated.sequence([
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    ]);
    titleAnim.start();

    const subAnim = Animated.sequence([
      Animated.delay(900),
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]);
    subAnim.start();

    // width is a layout property — this is the one non-native animation here
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    bar.start();

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathe.start();

    return () => {
      titleAnim.stop();
      subAnim.stop();
      bar.stop();
      breathe.stop();
    };
  }, [discOpacity, discScale, float, progress, subOpacity, titleOpacity, titleY]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_W],
  });

  return (
    <ScreenBackground colors={THEME.gradients.loader} decor={<Decor />}>
      <View style={styles.center}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.disc,
            { opacity: discOpacity, transform: [{ scale: discScale }] },
          ]}>
          <Animated.Image
            source={assets.logo}
            resizeMode="contain"
            style={[styles.logo, { transform: [{ translateY }] }]}
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}>
          AVIAA PILOT
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subOpacity }]}>
          PREFLIGHT CHECK
        </Animated.Text>

        <View style={styles.track}>
          <Animated.View
            pointerEvents="none"
            style={[styles.fill, { width: barWidth }]}>
            <LinearGradient
              colors={[...THEME.gradients.progress]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>LOADING...</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  disc: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 14,
  },
  logo: {
    width: 132,
    height: 132,
  },
  title: {
    marginTop: 34,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 5,
    color: '#F5F5F7',
    textShadowColor: 'rgba(230,57,70,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3.5,
    color: '#9A9AA8',
  },
  track: {
    marginTop: 40,
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  loading: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#6E6E7A',
  },
  rule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ruleTick: {
    position: 'absolute',
    left: '24%',
    top: -1,
    width: 28,
    height: 2,
    backgroundColor: '#F4A62A',
  },
  dot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});

export default LoaderScreen;
