import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';

export type ScreenBackgroundProps = {
  colors: readonly string[];
  children: React.ReactNode;
  angle?: 'vertical' | 'diagonal';
  decor?: React.ReactNode;
};

/**
 * bg_game is the only background in the app — screens are told apart by their
 * gradient overlay (the loader uses the darkest one).
 */
export function ScreenBackground({
  colors,
  children,
  angle = 'vertical',
  decor,
}: ScreenBackgroundProps) {
  const start = angle === 'vertical' ? { x: 0.5, y: 0 } : { x: 0, y: 0 };
  const end = angle === 'vertical' ? { x: 0.5, y: 1 } : { x: 1, y: 1 };

  return (
    <ImageBackground
      source={assets.bgGame}
      style={styles.root}
      resizeMode="cover">
      <LinearGradient
        colors={[...colors]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      {decor ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {decor}
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111114',
  },
  content: {
    flex: 1,
  },
});

export default ScreenBackground;
