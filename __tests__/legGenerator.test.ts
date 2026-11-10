import {
  fallbackLeg,
  generateLeg,
  OPENER_HIT_TIMES,
  solvabilityWalk,
  stampsReachable,
} from '../src/game/legGenerator';
import { makeSeed, mulberry32 } from '../src/game/rng';
import { LANES, PLANE_W, PLANE_X } from '../src/constants/config';

const params = {
  legIndex: 0,
  attempt: 1,
  speed: 160,
  durationMs: 10000,
  startLane: 1,
};

describe('leg generator', () => {
  it('is deterministic for a seed and different across seeds', () => {
    const a = generateLeg(params);
    const b = generateLeg(params);
    const c = generateLeg({ ...params, attempt: 2 });
    expect(a.entities.map(e => `${e.kind}${e.lane}${Math.round(e.x)}`)).toEqual(
      b.entities.map(e => `${e.kind}${e.lane}${Math.round(e.x)}`),
    );
    expect(c.seed).not.toBe(a.seed);
    expect(c.entities.map(e => e.lane).join('')).not.toBe(
      a.entities.map(e => e.lane).join(''),
    );
  });

  it('uses the documented seed formula', () => {
    expect(makeSeed(3, 7)).toBe(((3 * 7919) ^ (7 * 104729)) >>> 0);
    const rng = mulberry32(makeSeed(3, 7));
    const value = rng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it('opens with three bands in the starting lane so an idle run ends fast', () => {
    const plan = generateLeg(params);
    const openers = plan.entities.filter(
      e => e.kind === 'turb' && e.lane === params.startLane,
    );
    expect(openers.length).toBeGreaterThanOrEqual(3);
    OPENER_HIT_TIMES.forEach(t => {
      const x = PLANE_X + PLANE_W + params.speed * t;
      expect(plan.entities.some(e => Math.abs(e.x - x) < 1)).toBe(true);
    });
    expect(OPENER_HIT_TIMES[OPENER_HIT_TIMES.length - 1]).toBeLessThanOrEqual(3);
  });

  it('never blocks every lane at once and stays solvable', () => {
    for (let attempt = 1; attempt <= 12; attempt++) {
      const plan = generateLeg({ ...params, attempt });
      const walk = solvabilityWalk(plan.entities, params.startLane, params.speed);
      expect(walk.ok).toBe(true);
      expect(stampsReachable(plan.entities, walk.marks)).toBe(true);
      walk.marks.forEach(mark => {
        expect(mark.lanes.length).toBeGreaterThan(0);
        expect(mark.lanes.length).toBeLessThanOrEqual(LANES);
      });
    }
  });

  it('keeps a hand-authored fallback that is itself solvable', () => {
    const entities = fallbackLeg(160, 1);
    expect(entities.length).toBeGreaterThan(6);
    const walk = solvabilityWalk(entities, 1, 160);
    expect(walk.ok).toBe(true);
  });

  it('produces both stamps and turbulence', () => {
    const plan = generateLeg(params);
    expect(plan.entities.some(e => e.kind === 'stamp')).toBe(true);
    expect(plan.entities.some(e => e.kind === 'turb')).toBe(true);
    expect(plan.fallback).toBe(false);
  });
});
