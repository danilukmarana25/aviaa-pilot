import { WINGS } from '../constants/config';
import { wingDelta } from './landing';
import type { Tier } from './scoring';

export type WingState = { wings: number; shieldLeft: number; slip: number };

/** A turbulence hit. The AURORA perk forgives the first one of a session. */
export function applyTurbulence(state: WingState): WingState {
  if (state.shieldLeft > 0) {
    return { ...state, shieldLeft: state.shieldLeft - 1 };
  }
  return { ...state, wings: state.wings - 1, slip: 0 };
}

/** A landing. GOLD refunds a pip up to the cap, a MISS takes one. */
export function applyLanding(state: WingState, tier: Tier): WingState {
  return {
    ...state,
    wings: Math.max(0, Math.min(WINGS, state.wings + wingDelta(tier))),
  };
}

export function isScrubbed(state: WingState): boolean {
  return state.wings <= 0;
}
