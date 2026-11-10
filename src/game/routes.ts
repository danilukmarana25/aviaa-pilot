import { LEGS_CHALLENGE } from '../constants/config';
import type { RegionId } from './stamps';

export type ChallengeRoute = {
  id: string;
  name: string;
  objective: string;
  difficulty: 1 | 2 | 3;
  legs: number;
  turbDensity: number;
  stampDensity: number;
  region: RegionId;
  /** Rank index required to fly it. 0 = open from the first flight. */
  unlockRank: number;
};

export const ROUTES: ChallengeRoute[] = [
  {
    id: 'coastal',
    name: 'COASTAL RUN',
    objective: 'LAND 5 OF 5 WITHOUT A MISS',
    difficulty: 1,
    legs: LEGS_CHALLENGE,
    turbDensity: 0.9,
    stampDensity: 1.15,
    region: 'coast',
    unlockRank: 0,
  },
  {
    id: 'ridge',
    name: 'RIDGE CROSSING',
    objective: 'KEEP ALL 3 WINGS TO THE LAST STRIP',
    difficulty: 2,
    legs: LEGS_CHALLENGE,
    turbDensity: 1.15,
    stampDensity: 1,
    region: 'ridge',
    unlockRank: 1,
  },
  {
    id: 'aurora',
    name: 'AURORA MAIL',
    objective: 'HOLD SLIPSTREAM 10 INTO A LANDING',
    difficulty: 2,
    legs: LEGS_CHALLENGE,
    turbDensity: 1.25,
    stampDensity: 1.3,
    region: 'aurora',
    unlockRank: 3,
  },
  {
    id: 'storm',
    name: 'STORM MAIL',
    objective: 'SCORE 2 500 IN ONE ROUTE',
    difficulty: 3,
    legs: LEGS_CHALLENGE,
    turbDensity: 1.5,
    stampDensity: 1.1,
    region: 'aurora',
    unlockRank: 5,
  },
];

export function isRouteUnlocked(route: ChallengeRoute, rankIndex: number): boolean {
  return rankIndex >= route.unlockRank;
}

export function routeById(id: string): ChallengeRoute | undefined {
  return ROUTES.find(r => r.id === id);
}

export function unlockLine(route: ChallengeRoute, rankName: string): string {
  return `LOCKED - REACH RANK ${rankName}`;
}
