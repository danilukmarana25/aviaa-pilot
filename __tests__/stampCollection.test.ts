import { overlaps, shrink } from '../src/game/collision';
import { slipMultiplier, stampValue } from '../src/game/scoring';
import { stampForLeg, stampsOfRegion } from '../src/game/stamps';

describe('stamp collection', () => {
  it('detects an overlap only when the boxes actually touch', () => {
    const plane = { x: 26, y: 40, w: 72, h: 46 };
    const onPath = { x: 80, y: 44, w: 34, h: 34 };
    const ahead = { x: 300, y: 44, w: 34, h: 34 };
    expect(overlaps(plane, onPath)).toBe(true);
    expect(overlaps(plane, ahead)).toBe(false);
  });

  it('shrinks the plane box so a graze is not a pickup', () => {
    const plane = shrink({ x: 26, y: 40, w: 72, h: 46 }, 6);
    expect(plane.x).toBe(32);
    expect(plane.w).toBe(60);
  });

  it('pays 10 points scaled by the slipstream multiplier', () => {
    expect(stampValue(0)).toBe(10);
    expect(stampValue(5)).toBe(15);
    expect(stampValue(10)).toBe(20);
    expect(stampValue(100)).toBe(10 * slipMultiplier(100));
  });

  it('credits one stamp per leg from the flown region', () => {
    const list = stampsOfRegion('coast');
    expect(list).toHaveLength(4);
    expect(stampForLeg('coast', 0).id).toBe(list[0].id);
    expect(stampForLeg('coast', 5).id).toBe(list[1].id);
  });
});
