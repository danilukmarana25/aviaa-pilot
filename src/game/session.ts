import { completeDaily } from './daily';
import { mergeRank, xpForScore } from './scoring';
import type { CareerRecord, TierCounts } from './storage';
import type { Tier } from './scoring';

export type SessionMode = 'free' | 'challenge' | 'daily';

export type SessionSummary = {
  mode: SessionMode;
  routeId?: string;
  routeName: string;
  legs: number;
  legsFlown: number;
  score: number;
  completed: boolean;
  wingsLeft: number;
  newStamps: string[];
  tiers: TierCounts;
  bestLanding: Tier | null;
  bestBefore: number;
  isNewBest: boolean;
};

export function emptyTiers(): TierCounts {
  return { gold: 0, silver: 0, bronze: 0, miss: 0 };
}

export function addTier(tiers: TierCounts, tier: Tier): TierCounts {
  return { ...tiers, [tier]: tiers[tier] + 1 };
}

/** Folds one finished session into the persisted career. A rank never decreases. */
export function applySession(
  career: CareerRecord,
  summary: SessionSummary,
  today: string,
): CareerRecord {
  const xp = career.xp + xpForScore(summary.score);
  const stamps = career.stamps.slice();
  for (const id of summary.newStamps) {
    if (!stamps.includes(id)) {
      stamps.push(id);
    }
  }
  const routeBests = { ...career.routeBests };
  if (summary.routeId) {
    routeBests[summary.routeId] = Math.max(
      routeBests[summary.routeId] || 0,
      summary.score,
    );
  }
  const daily =
    summary.mode === 'daily'
      ? completeDaily(career.daily, today, summary.score)
      : career.daily;

  return {
    ...career,
    flights: career.flights + 1,
    bestScore: Math.max(career.bestScore, summary.score),
    xp,
    rankIndex: mergeRank(career.rankIndex, xp),
    stamps,
    tiers: {
      gold: career.tiers.gold + summary.tiers.gold,
      silver: career.tiers.silver + summary.tiers.silver,
      bronze: career.tiers.bronze + summary.tiers.bronze,
      miss: career.tiers.miss + summary.tiers.miss,
    },
    routeBests,
    daily,
  };
}

export function headline(summary: SessionSummary): string {
  if (!summary.completed) {
    return 'WINGS SCRUBBED';
  }
  if (summary.tiers.miss === 0 && summary.tiers.gold >= summary.legs) {
    return 'PERFECT TOUCHDOWN';
  }
  return 'ROUTE COMPLETE';
}

export function subline(summary: SessionSummary): string {
  const legs = `${summary.legsFlown} LEGS`;
  const gold = `${summary.tiers.gold} GOLD LANDINGS`;
  return `${legs} - ${gold}`;
}
