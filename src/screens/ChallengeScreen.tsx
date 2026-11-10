import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Plane } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteCard } from '../components/RouteCard';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { isRouteUnlocked, ROUTES, unlockLine, type ChallengeRoute } from '../game/routes';
import { RANKS } from '../game/scoring';
import { useCareerSelector } from '../hooks/usePersistentState';

export type ChallengeScreenProps = {
  onStartRoute: (route: ChallengeRoute) => void;
  onMenu: () => void;
};

export function ChallengeScreen({ onStartRoute, onMenu }: ChallengeScreenProps) {
  const rankIndex = useCareerSelector(r => r.rankIndex);
  const routeBests = useCareerSelector(r => r.routeBests);
  const [selected, setSelected] = useState<string>(ROUTES[0].id);
  const [flashing, setFlashing] = useState<string | null>(null);

  const handlePress = useCallback(
    (route: ChallengeRoute) => {
      if (!isRouteUnlocked(route, rankIndex)) {
        setFlashing(route.id);
        setTimeout(() => setFlashing(null), 1200);
        return;
      }
      setSelected(route.id);
    },
    [rankIndex],
  );

  const current = ROUTES.find(r => r.id === selected) || ROUTES[0];
  const canStart = isRouteUnlocked(current, rankIndex);

  return (
    <ScreenBackground colors={THEME.gradients.panel}>
      <ScreenHeader
        title="CHALLENGE"
        subtitle="5 LEG ROUTES"
        rightSlot={
          <SecondaryButton label="MENU" onPress={onMenu} width={92} height={48} />
        }
      />

      <View style={styles.content}>
        <View style={styles.list}>
          {ROUTES.map(route => {
            const locked = !isRouteUnlocked(route, rankIndex);
            return (
              <RouteCard
                key={route.id}
                route={route}
                locked={locked}
                lockLine={unlockLine(route, RANKS[route.unlockRank])}
                best={routeBests[route.id] || 0}
                selected={route.id === selected && !locked}
                flashing={flashing === route.id}
                onPress={handlePress}
              />
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>
            {canStart
              ? `SELECTED ${current.name} - ${current.objective}`
              : 'PICK AN UNLOCKED ROUTE TO FLY'}
          </Text>
          <PrimaryButton
            label="START ROUTE"
            Icon={Plane}
            height={52}
            disabled={!canStart}
            onPress={() => onStartRoute(current)}
            testID="btn-start-route"
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  list: {
    gap: 10,
  },
  footer: {
    gap: 12,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.text.muted,
  },
});

export default ChallengeScreen;
