import { applySession, emptyTiers, type SessionSummary } from '../src/game/session';
import { freshCareer } from '../src/game/storage';
import { accuracyPercent, RANKS, xpInRank } from '../src/game/scoring';
import { STAMPS } from '../src/game/stamps';

const summary = (over: Partial<SessionSummary> = {}): SessionSummary => ({
  mode: 'free',
  routeName: 'FREE FLIGHT',
  legs: 3,
  legsFlown: 3,
  score: 1200,
  completed: true,
  wingsLeft: 2,
  newStamps: ['c1'],
  tiers: { ...emptyTiers(), gold: 2, silver: 1 },
  bestLanding: 'gold',
  bestBefore: 0,
  isNewBest: true,
  ...over,
});

describe('progress stats', () => {
  it('folds a finished session into the career', () => {
    const next = applySession(freshCareer(), summary(), '2026-11-10');
    expect(next.flights).toBe(1);
    expect(next.bestScore).toBe(1200);
    expect(next.xp).toBe(120);
    expect(next.stamps).toEqual(['c1']);
    expect(next.tiers.gold).toBe(2);
  });

  it('keeps the better best score', () => {
    const career = { ...freshCareer(), bestScore: 2000 };
    const next = applySession(career, summary({ score: 900 }), '2026-11-10');
    expect(next.bestScore).toBe(2000);
  });

  it('never stores the same stamp twice', () => {
    let career = applySession(freshCareer(), summary(), '2026-11-10');
    career = applySession(career, summary(), '2026-11-10');
    expect(career.stamps).toEqual(['c1']);
    expect(career.flights).toBe(2);
  });

  it('records a per-route best for a challenge', () => {
    const next = applySession(
      freshCareer(),
      summary({ mode: 'challenge', routeId: 'ridge', score: 1500 }),
      '2026-11-10',
    );
    expect(next.routeBests.ridge).toBe(1500);
  });

  it('renders an empty career as zero everywhere', () => {
    const career = freshCareer();
    expect(career.flights).toBe(0);
    expect(career.stamps).toHaveLength(0);
    expect(accuracyPercent(career.tiers)).toBe(0);
    expect(RANKS[career.rankIndex]).toBe('CADET');
    expect(xpInRank(career.xp).current).toBe(0);
    expect(STAMPS.length).toBe(12);
  });
});
