import {
  BRONZE_PX,
  GOLD_PX,
  SILVER_PX,
  ZONE_BASE_W,
  ZONE_BONUS_CAP,
  ZONE_BONUS_PER_TIER,
  SLIP_TIER,
} from '../constants/config';
import type { Perks } from './stamps';
import type { Tier } from './scoring';

/** Slipstream (and the RIDGE perk) widen the safe zone. */
export function zoneBonus(slip: number, perks?: Perks): number {
  const fromSlip = Math.min(
    ZONE_BONUS_CAP,
    Math.floor(Math.max(0, slip) / SLIP_TIER) * ZONE_BONUS_PER_TIER,
  );
  return fromSlip + (perks && perks.wideStrip ? 6 : 0);
}

export function zoneWidth(slip: number, perks?: Perks): number {
  return ZONE_BASE_W + zoneBonus(slip, perks);
}

/** d = |ringCenter - zoneCenter| in px. */
export function resolveTier(d: number, bonus: number): Tier {
  const dist = Math.abs(d);
  if (dist <= GOLD_PX) {
    return 'gold';
  }
  if (dist <= SILVER_PX) {
    return 'silver';
  }
  if (dist <= BRONZE_PX + Math.max(0, bonus)) {
    return 'bronze';
  }
  return 'miss';
}

export const TIER_LABEL: Record<Tier, string> = {
  gold: 'PERFECT TOUCHDOWN',
  silver: 'CLEAN LANDING',
  bronze: 'ROUGH LANDING',
  miss: 'MISSED THE STRIP',
};

export const TIER_SHORT: Record<Tier, string> = {
  gold: 'GOLD',
  silver: 'SILVER',
  bronze: 'BRONZE',
  miss: 'MISS',
};

/** GOLD gives a wing point back (capped), MISS takes one. */
export function wingDelta(tier: Tier): number {
  if (tier === 'gold') {
    return 1;
  }
  if (tier === 'miss') {
    return -1;
  }
  return 0;
}
