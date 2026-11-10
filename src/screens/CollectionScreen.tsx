import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Album } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StampTile } from '../components/StampTile';
import {
  ownedInRegion,
  regionComplete,
  REGIONS,
  stampsOfRegion,
  type Stamp,
} from '../game/stamps';
import { useCareerSelector } from '../hooks/usePersistentState';

export type CollectionScreenProps = {
  onMenu: () => void;
};

export function CollectionScreen({ onMenu }: CollectionScreenProps) {
  const owned = useCareerSelector(r => r.stamps);
  const [detail, setDetail] = useState<Stamp | null>(null);

  const region = detail ? REGIONS.find(r => r.id === detail.region) : null;

  return (
    <ScreenBackground colors={THEME.gradients.panel}>
      <ScreenHeader
        title="COLLECTION"
        subtitle="ROUTE STAMP ALBUM"
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {owned.length === 0 ? (
          <EmptyState Icon={Album} text="FLY A LEG TO EARN YOUR FIRST STAMP" />
        ) : null}

        {REGIONS.map(reg => {
          const list = stampsOfRegion(reg.id);
          const count = ownedInRegion(owned, reg.id);
          const complete = regionComplete(owned, reg.id);
          return (
            <View key={reg.id} style={styles.region}>
              <View style={styles.regionHead}>
                <Text style={styles.regionName}>{reg.name}</Text>
                <View style={styles.regionRight}>
                  {complete ? (
                    <View style={styles.perkChip}>
                      <Text style={styles.perkChipText}>PERK ACTIVE</Text>
                    </View>
                  ) : null}
                  <Text style={styles.regionCount}>{`${count}/4`}</Text>
                </View>
              </View>
              <View style={styles.grid}>
                {list.map(stamp => (
                  <StampTile
                    key={stamp.id}
                    stamp={stamp}
                    owned={owned.includes(stamp.id)}
                    selected={detail ? detail.id === stamp.id : false}
                    onPress={setDetail}
                  />
                ))}
              </View>
              <Text style={styles.perkLine}>
                {complete ? reg.perk : `COMPLETE 4 TO UNLOCK - ${reg.perkShort}`}
              </Text>
            </View>
          );
        })}

        {detail && region ? (
          <View style={styles.detail}>
            <Text style={styles.detailName}>{detail.name}</Text>
            <Text style={styles.detailLine}>
              {`DROPS ON ${detail.leg} OF THE ${region.name}`}
            </Text>
            <Text style={styles.detailPerk}>{region.perk}</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 16,
  },
  region: {
    gap: 10,
  },
  regionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.muted,
  },
  regionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  perkChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.radius.pill,
    backgroundColor: 'rgba(244,166,42,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,166,42,0.7)',
  },
  perkChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: THEME.colors.accent.secondary,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  perkLine: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: THEME.colors.text.muted,
  },
  detail: {
    padding: 14,
    gap: 6,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.bg.tertiary,
    borderWidth: 1,
    borderColor: 'rgba(244,166,42,0.45)',
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: THEME.colors.text.primary,
  },
  detailLine: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.text.secondary,
  },
  detailPerk: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.accent.secondary,
  },
});

export default CollectionScreen;
