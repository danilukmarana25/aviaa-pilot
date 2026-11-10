import { isRouteUnlocked, routeById, ROUTES, unlockLine } from '../src/game/routes';
import { LEGS_CHALLENGE } from '../src/constants/config';
import { RANKS } from '../src/game/scoring';

describe('challenge routes', () => {
  it('offers exactly four named 5-leg routes', () => {
    expect(ROUTES).toHaveLength(4);
    ROUTES.forEach(route => {
      expect(route.legs).toBe(LEGS_CHALLENGE);
      expect(route.name.length).toBeGreaterThan(3);
      expect(route.objective.length).toBeGreaterThan(8);
    });
  });

  it('opens the first route from the first flight and locks the rest', () => {
    expect(isRouteUnlocked(ROUTES[0], 0)).toBe(true);
    expect(isRouteUnlocked(ROUTES[2], 0)).toBe(false);
    expect(isRouteUnlocked(ROUTES[2], ROUTES[2].unlockRank)).toBe(true);
  });

  it('explains a lock with the required rank', () => {
    const line = unlockLine(ROUTES[3], RANKS[ROUTES[3].unlockRank]);
    expect(line).toContain('LOCKED');
    expect(line).toContain(RANKS[ROUTES[3].unlockRank]);
  });

  it('scales turbulence with the difficulty dots', () => {
    const easy = ROUTES[0];
    const hard = ROUTES[3];
    expect(hard.difficulty).toBeGreaterThan(easy.difficulty);
    expect(hard.turbDensity).toBeGreaterThan(easy.turbDensity);
  });

  it('looks a route up by id', () => {
    expect(routeById('storm')?.name).toBe('STORM MAIL');
    expect(routeById('nope')).toBeUndefined();
  });
});
