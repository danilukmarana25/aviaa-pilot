import { applyLanding, applyTurbulence, isScrubbed } from '../src/game/wings';
import { WINGS } from '../src/constants/config';

const fresh = { wings: WINGS, shieldLeft: 0, slip: 9 };

describe('wing integrity', () => {
  it('loses a pip and the slipstream on a turbulence hit', () => {
    const after = applyTurbulence(fresh);
    expect(after.wings).toBe(WINGS - 1);
    expect(after.slip).toBe(0);
  });

  it('forgives the first hit while the storm shield is up', () => {
    const shielded = applyTurbulence({ ...fresh, shieldLeft: 1 });
    expect(shielded.wings).toBe(WINGS);
    expect(shielded.slip).toBe(9);
    expect(applyTurbulence(shielded).wings).toBe(WINGS - 1);
  });

  it('refunds a pip on a gold landing but never above the cap', () => {
    const hurt = applyTurbulence(fresh);
    expect(applyLanding(hurt, 'gold').wings).toBe(WINGS);
    expect(applyLanding(fresh, 'gold').wings).toBe(WINGS);
  });

  it('takes a pip on a miss and ends the session at zero', () => {
    let s = { wings: 1, shieldLeft: 0, slip: 0 };
    s = applyLanding(s, 'miss');
    expect(s.wings).toBe(0);
    expect(isScrubbed(s)).toBe(true);
  });
});
