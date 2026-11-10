import fs from 'fs';
import path from 'path';
import { LOADER_DURATION_MS } from '../src/constants/config';
import { deserialize, freshCareer } from '../src/game/storage';
import { headline, subline, emptyTiers, type SessionSummary } from '../src/game/session';

const SCREENS = path.join(__dirname, '..', 'src', 'screens');
const read = (name: string) =>
  fs.readFileSync(path.join(SCREENS, name), 'utf8');

const summary = (over: Partial<SessionSummary> = {}): SessionSummary => ({
  mode: 'free',
  routeName: 'FREE FLIGHT',
  legs: 3,
  legsFlown: 3,
  score: 800,
  completed: true,
  wingsLeft: 3,
  newStamps: [],
  tiers: { ...emptyTiers(), gold: 3 },
  bestLanding: 'gold',
  bestBefore: 0,
  isNewBest: false,
  ...over,
});

describe('screen states', () => {
  it('holds the loader for exactly 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('ships every screen of the flow', () => {
    const files = fs.readdirSync(SCREENS);
    [
      'LoaderScreen.tsx',
      'MenuScreen.tsx',
      'GameScreen.tsx',
      'ResultScreen.tsx',
      'ChallengeScreen.tsx',
      'ProgressScreen.tsx',
      'CollectionScreen.tsx',
      'DailyScreen.tsx',
      'SettingsScreen.tsx',
    ].forEach(name => expect(files).toContain(name));
  });

  it('writes the result headline in the game own words', () => {
    expect(headline(summary({ completed: false }))).toBe('WINGS SCRUBBED');
    expect(headline(summary())).toBe('PERFECT TOUCHDOWN');
    expect(headline(summary({ tiers: { ...emptyTiers(), gold: 1, miss: 1 } }))).toBe(
      'ROUTE COMPLETE',
    );
    expect(subline(summary())).toContain('GOLD LANDINGS');
  });

  it('gives every emptiable screen a themed empty line', () => {
    expect(read('CollectionScreen.tsx')).toContain('FLY A LEG TO EARN YOUR FIRST STAMP');
    expect(read('ProgressScreen.tsx')).toContain('NO FLIGHTS LOGGED YET');
    expect(read('ResultScreen.tsx')).toContain('NO NEW STAMPS THIS ROUTE');
    expect(read('MenuScreen.tsx')).toContain('FIRST FLIGHT');
  });

  it('keeps the loader free of a play button and of touch handlers', () => {
    const loader = read('LoaderScreen.tsx');
    expect(loader).not.toContain('Pressable');
    expect(loader).not.toContain('onPress');
    expect(loader).toContain('LOADING...');
  });

  it('falls back to a fresh career when the store is unreadable', () => {
    expect(deserialize('{{{').flights).toBe(freshCareer().flights);
  });
});
