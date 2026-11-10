import { resolveTier, wingDelta, zoneBonus, zoneWidth } from '../src/game/landing';
import { landingPoints } from '../src/game/scoring';
import { NO_PERKS } from '../src/game/stamps';
import { BRONZE_PX, GOLD_PX, SILVER_PX, ZONE_BASE_W } from '../src/constants/config';

describe('landing precision', () => {
  it('maps the offset to a tier', () => {
    expect(resolveTier(0, 0)).toBe('gold');
    expect(resolveTier(GOLD_PX, 0)).toBe('gold');
    expect(resolveTier(GOLD_PX + 1, 0)).toBe('silver');
    expect(resolveTier(SILVER_PX + 1, 0)).toBe('bronze');
    expect(resolveTier(BRONZE_PX + 1, 0)).toBe('miss');
  });

  it('treats the offset symmetrically', () => {
    expect(resolveTier(-4, 0)).toBe('gold');
    expect(resolveTier(-30, 0)).toBe('bronze');
  });

  it('pays gold the most and a miss nothing', () => {
    expect(landingPoints('gold')).toBe(150);
    expect(landingPoints('silver')).toBe(90);
    expect(landingPoints('bronze')).toBe(40);
    expect(landingPoints('miss')).toBe(0);
  });

  it('gives a wing back on gold and takes one on a miss', () => {
    expect(wingDelta('gold')).toBe(1);
    expect(wingDelta('silver')).toBe(0);
    expect(wingDelta('miss')).toBe(-1);
  });

  it('starts from the base zone with no slipstream', () => {
    expect(zoneBonus(0, NO_PERKS)).toBe(0);
    expect(zoneWidth(0, NO_PERKS)).toBe(ZONE_BASE_W);
  });
});
