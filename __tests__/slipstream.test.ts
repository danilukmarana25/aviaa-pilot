import { slipMultiplier } from '../src/game/scoring';
import { zoneBonus } from '../src/game/landing';
import { NO_PERKS } from '../src/game/stamps';
import { SLIP_MULT_CAP, ZONE_BONUS_CAP } from '../src/constants/config';

describe('slipstream', () => {
  it('raises the multiplier one tier every 5 pickups', () => {
    expect(slipMultiplier(0)).toBe(1);
    expect(slipMultiplier(4)).toBe(1);
    expect(slipMultiplier(5)).toBe(1.5);
    expect(slipMultiplier(10)).toBe(2);
  });

  it('caps the multiplier', () => {
    expect(slipMultiplier(999)).toBe(SLIP_MULT_CAP);
  });

  it('widens the landing safe zone with the same tiers and caps it', () => {
    expect(zoneBonus(0, NO_PERKS)).toBe(0);
    expect(zoneBonus(5, NO_PERKS)).toBe(14);
    expect(zoneBonus(10, NO_PERKS)).toBe(28);
    expect(zoneBonus(999, NO_PERKS)).toBe(ZONE_BONUS_CAP);
  });

  it('is emptied by a turbulence hit', () => {
    let slip = 12;
    slip = 0; // what the session does on a hit
    expect(slipMultiplier(slip)).toBe(1);
  });
});
