import {
  NO_MISS_BONUS,
  RANK_STEP_XP,
  ROUTE_LEG_BONUS,
  SLIP_MULT_CAP,
  SLIP_TIER,
  XP_PER_POINT,
} from '../constants/config';

/** Fictional pilot points only. There is no money surface anywhere in this app. */
export const RANKS = [
  'CADET',
  'WINGMAN',
  'NAVIGATOR',
  'SKIPPER',
  'AVIATOR',
  'MAILPILOT',
  'COMMANDER',
  'CAPTAIN',
] as const;

export type Rank = (typeof RANKS)[number];

export function slipMultiplier(slip: number): number {
  const m = 1 + Math.floor(Math.max(0, slip) / SLIP_TIER) * 0.5;
  return Math.min(SLIP_MULT_CAP, m);
}

export function stampValue(slip: number): number {
  return Math.round(10 * slipMultiplier(slip));
}

export const LANDING_POINTS = {
  gold: 150,
  silver: 90,
  bronze: 40,
  miss: 0,
} as const;

export type Tier = keyof typeof LANDING_POINTS;

export function landingPoints(tier: Tier): number {
  return LANDING_POINTS[tier];
}

export function routeBonus(legs: number, misses: number): number {
  const base = legs * ROUTE_LEG_BONUS;
  return misses === 0 ? base + NO_MISS_BONUS : base;
}

export function xpForScore(score: number): number {
  return Math.floor(Math.max(0, score) * XP_PER_POINT);
}

export function rankIndexForXp(xp: number): number {
  const idx = Math.floor(Math.max(0, xp) / RANK_STEP_XP);
  return Math.min(RANKS.length - 1, idx);
}

export function rankForXp(xp: number): Rank {
  return RANKS[rankIndexForXp(xp)];
}

/** A rank never decreases. */
export function mergeRank(previousIndex: number, xp: number): number {
  return Math.max(previousIndex, rankIndexForXp(xp));
}

export function xpInRank(xp: number): { current: number; needed: number } {
  const idx = rankIndexForXp(xp);
  if (idx >= RANKS.length - 1) {
    return { current: RANK_STEP_XP, needed: RANK_STEP_XP };
  }
  return { current: Math.max(0, xp) % RANK_STEP_XP, needed: RANK_STEP_XP };
}

export function accuracyPercent(tiers: {
  gold: number;
  silver: number;
  bronze: number;
  miss: number;
}): number {
  const total = tiers.gold + tiers.silver + tiers.bronze + tiers.miss;
  if (total <= 0) {
    return 0;
  }
  const weighted = tiers.gold * 1 + tiers.silver * 0.75 + tiers.bronze * 0.4;
  return Math.round((weighted / total) * 100);
}

/** 1240 -> "1 240" (space grouped, never a currency symbol). */
export function formatPoints(value: number): string {
  const n = Math.max(0, Math.floor(value));
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) {
      out += ' ';
    }
    out += s[i];
  }
  return out;
}
