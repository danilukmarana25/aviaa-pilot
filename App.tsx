/**
 * AviaaPilot — one-thumb lane flying and precision landing.
 * App.tsx owns the screen state machine and the hardware Back handler only;
 * no gameplay lives here and there is no navigation library.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { AppShell } from './src/components/AppShell';
import { THEME } from './src/constants/theme';
import { dateKey, seedFromDateKey } from './src/game/daily';
import type { ChallengeRoute } from './src/game/routes';
import { applySession, type SessionMode, type SessionSummary } from './src/game/session';
import { careerStore, useCareerSelector } from './src/hooks/usePersistentState';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DailyScreen } from './src/screens/DailyScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

type Launch = {
  mode: SessionMode;
  route?: ChallengeRoute;
  seedSalt: number;
};

const FREE_LAUNCH: Launch = { mode: 'free', seedSalt: 1 };

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [launch, setLaunch] = useState<Launch>(FREE_LAUNCH);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const attempt = useRef(1);
  const reducedMotion = useCareerSelector(r => r.settings.reducedMotion);

  const goMenu = useCallback(() => setScreen('menu'), []);

  const startFree = useCallback(() => {
    attempt.current += 1;
    setLaunch({ mode: 'free', seedSalt: attempt.current * 13 + 1 });
    setScreen('game');
  }, []);

  const startRoute = useCallback((route: ChallengeRoute) => {
    attempt.current += 1;
    setLaunch({
      mode: 'challenge',
      route,
      seedSalt: attempt.current * 13 + route.name.length,
    });
    setScreen('game');
  }, []);

  const startDaily = useCallback(() => {
    const today = dateKey(new Date());
    setLaunch({ mode: 'daily', seedSalt: seedFromDateKey(today) % 100000 });
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((raw: SessionSummary) => {
    const before = careerStore.get();
    const bestBefore = raw.routeId
      ? before.routeBests[raw.routeId] || 0
      : before.bestScore;
    const finished: SessionSummary = {
      ...raw,
      bestBefore,
      isNewBest: raw.score > bestBefore && raw.score > 0,
    };
    const today = dateKey(new Date());
    careerStore.set(applySession(before, finished, today));
    setSummary(finished);
    setScreen('result');
  }, []);

  const replay = useCallback(() => {
    attempt.current += 1;
    if (launch.mode === 'challenge' && launch.route) {
      startRoute(launch.route);
      return;
    }
    startFree();
  }, [launch.mode, launch.route, startFree, startRoute]);

  useEffect(() => {
    const onBack = () => {
      if (screen === 'loader') {
        return true;
      }
      if (screen === 'menu') {
        return false; // let the system close the app
      }
      setScreen('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen]);

  const renderScreen = useCallback(
    (key: Screen) => {
      switch (key) {
        case 'loader':
          return <LoaderScreen onDone={goMenu} />;
        case 'game':
          return (
            <GameScreen
              key={`game-${launch.seedSalt}`}
              mode={launch.mode}
              route={launch.route}
              seedSalt={launch.seedSalt}
              onGameOver={handleGameOver}
              onExit={goMenu}
            />
          );
        case 'result':
          return summary ? (
            <ResultScreen
              summary={summary}
              onAgain={replay}
              onMenu={goMenu}
              onCollection={() => setScreen('collection')}
            />
          ) : (
            <MenuScreen
              onPlay={startFree}
              onChallenge={() => setScreen('challenge')}
              onDaily={() => setScreen('daily')}
              onProgress={() => setScreen('progress')}
              onCollection={() => setScreen('collection')}
              onSettings={() => setScreen('settings')}
            />
          );
        case 'challenge':
          return <ChallengeScreen onStartRoute={startRoute} onMenu={goMenu} />;
        case 'progress':
          return <ProgressScreen onMenu={goMenu} />;
        case 'collection':
          return <CollectionScreen onMenu={goMenu} />;
        case 'daily':
          return <DailyScreen onStartDaily={startDaily} onMenu={goMenu} />;
        case 'settings':
          return <SettingsScreen onMenu={goMenu} />;
        case 'menu':
        default:
          return (
            <MenuScreen
              onPlay={startFree}
              onChallenge={() => setScreen('challenge')}
              onDaily={() => setScreen('daily')}
              onProgress={() => setScreen('progress')}
              onCollection={() => setScreen('collection')}
              onSettings={() => setScreen('settings')}
            />
          );
      }
    },
    [
      goMenu,
      handleGameOver,
      launch.mode,
      launch.route,
      launch.seedSalt,
      replay,
      startDaily,
      startFree,
      startRoute,
      summary,
    ],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppShell
        screenKey={screen}
        reducedMotion={reducedMotion}
        renderScreen={renderScreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.bg.primary,
  },
});

export default App;
