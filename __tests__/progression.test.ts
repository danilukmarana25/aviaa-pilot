import {
  accuracyPercent,
  formatPoints,
  mergeRank,
  RANKS,
  rankForXp,
  rankIndexForXp,
  routeBonus,
  xpForScore,
  xpInRank,
} from '../src/game/scoring';
import { RANK_STEP_XP } from '../src/constants/config';

describe('progression', () => {
  it('converts score into xp', () => {
    expect(xpForScore(1280)).toBe(128);
    expect(xpForScore(0)).toBe(0);
  });

  it('promotes one rank every 600 xp across 8 ranks', () => {
    expect(rankForXp(0)).toBe('CADET');
    expect(rankIndexForXp(RANK_STEP_XP)).toBe(1);
    expect(rankIndexForXp(RANK_STEP_XP * 99)).toBe(RANKS.length - 1);
  });

  it('never demotes a pilot', () => {
    expect(mergeRank(4, 0)).toBe(4);
    expect(mergeRank(1, RANK_STEP_XP * 3)).toBe(3);
  });

  it('reports the xp inside the current rank', () => {
    const bar = xpInRank(RANK_STEP_XP + 120);
    expect(bar.current).toBe(120);
    expect(bar.needed).toBe(RANK_STEP_XP);
  });

  it('adds a no-miss bonus to a completed route', () => {
    expect(routeBonus(3, 1)).toBe(150);
    expect(routeBonus(3, 0)).toBe(350);
  });

  it('weights landing accuracy and formats points with spaces', () => {
    expect(accuracyPercent({ gold: 0, silver: 0, bronze: 0, miss: 0 })).toBe(0);
    expect(accuracyPercent({ gold: 2, silver: 0, bronze: 0, miss: 2 })).toBe(50);
    expect(formatPoints(1240)).toBe('1 240');
    expect(formatPoints(12480)).toBe('12 480');
  });
});
