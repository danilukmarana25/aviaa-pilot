import { NO_PERKS, perksFromStamps } from '../src/game/stamps';
import { zoneBonus } from '../src/game/landing';
import { applyTurbulence } from '../src/game/wings';
import { WINGS } from '../src/constants/config';

describe('region route card perks', () => {
  it('grants nothing while a region is incomplete', () => {
    expect(perksFromStamps(['c1', 'c2', 'c3'])).toEqual(NO_PERKS);
  });

  it('coast gives a warm start at slipstream 5', () => {
    const perks = perksFromStamps(['c1', 'c2', 'c3', 'c4']);
    expect(perks.warmStart).toBe(true);
    expect(perks.wideStrip).toBe(false);
  });

  it('ridge widens the landing safe zone by 6 px', () => {
    const perks = perksFromStamps(['r1', 'r2', 'r3', 'r4']);
    expect(perks.wideStrip).toBe(true);
    expect(zoneBonus(0, perks)).toBe(zoneBonus(0, NO_PERKS) + 6);
  });

  it('aurora forgives the first turbulence hit of a session', () => {
    const perks = perksFromStamps(['a1', 'a2', 'a3', 'a4']);
    expect(perks.stormShield).toBe(true);
    const start = { wings: WINGS, shieldLeft: perks.stormShield ? 1 : 0, slip: 7 };
    const afterFirst = applyTurbulence(start);
    expect(afterFirst.wings).toBe(WINGS);
    expect(applyTurbulence(afterFirst).wings).toBe(WINGS - 1);
  });

  it('stacks across regions', () => {
    const perks = perksFromStamps([
      'c1', 'c2', 'c3', 'c4',
      'r1', 'r2', 'r3', 'r4',
    ]);
    expect(perks.warmStart).toBe(true);
    expect(perks.wideStrip).toBe(true);
    expect(perks.stormShield).toBe(false);
  });
});
