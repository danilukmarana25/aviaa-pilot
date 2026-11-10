import React from 'react';
import { Animated, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type SegmentOption = { value: string; label: string };

export type SettingRowProps = {
  label: string;
  hint?: string;
} & (
  | {
      kind: 'segment';
      value: string;
      options: SegmentOption[];
      onChange: (value: string) => void;
    }
  | {
      kind: 'switch';
      value: boolean;
      onChange: (value: boolean) => void;
    }
);

function Segment({
  option,
  active,
  onPress,
}: {
  option: SegmentOption;
  active: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected: active }}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.segmentPress}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.segment,
          active ? styles.segmentActive : null,
          { transform: [{ scale }] },
        ]}>
        <Text
          style={[styles.segmentText, active ? styles.segmentTextActive : null]}
          numberOfLines={1}>
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function SettingRow(props: SettingRowProps) {
  const { label, hint } = props;
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={styles.hint} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      {props.kind === 'switch' ? (
        <Switch
          value={props.value}
          onValueChange={props.onChange}
          accessibilityLabel={label}
          trackColor={{
            false: 'rgba(255,255,255,0.12)',
            true: 'rgba(244,166,42,0.55)',
          }}
          thumbColor={props.value ? THEME.colors.accent.secondary : '#8A8A96'}
        />
      ) : (
        <View style={styles.segments}>
          {props.options.map(option => (
            <Segment
              key={option.value}
              option={option}
              active={option.value === props.value}
              onPress={() => props.onChange(option.value)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: THEME.colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  labelCol: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.text.primary,
  },
  hint: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: THEME.colors.text.muted,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentPress: {
    height: 48,
    minWidth: 72,
    justifyContent: 'center',
  },
  segment: {
    height: 36,
    minWidth: 72,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  segmentActive: {
    backgroundColor: 'rgba(244,166,42,0.16)',
    borderColor: 'rgba(244,166,42,0.7)',
  },
  segmentText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.text.muted,
  },
  segmentTextActive: {
    color: THEME.colors.accent.secondary,
  },
});

export default SettingRow;
