import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

export type ScreenHeaderProps = {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  subtitle?: string;
  centerExtra?: React.ReactNode;
  bare?: boolean;
};

/**
 * The one header used by every screen (Menu, Game, Result and the five routes).
 * Different leftSlot / title / rightSlot per screen — never inline header markup.
 */
export function ScreenHeader({
  title,
  leftSlot,
  rightSlot,
  subtitle,
  centerExtra,
  bare = false,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, bare ? styles.bare : null]}>
      <View style={styles.side}>{leftSlot ?? null}</View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {centerExtra ?? null}
      </View>
      <View style={styles.sideRight}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    height: 116,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.ui.border,
  },
  bare: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  side: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sideRight: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: THEME.colors.text.muted,
  },
});

export default ScreenHeader;
