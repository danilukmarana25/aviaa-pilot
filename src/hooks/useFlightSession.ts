import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APPROACH_MS,
  BASE_SPEED,
  BOARD_FRAME,
  HINT_IDLE_MS,
  HINT_VISIBLE_MS,
  HIT_SHRINK,
  INVULN_MS,
  LANES,
  LAND_TIMEOUT_MS,
  LEGS_FREE,
  LEG_DURATION_MS,
  PLANE_H,
  PLANE_W,
  PLANE_X,
  RESOLVE_HOLD_MS,
  SPEED_CAP,
  SPEED_STEP,
  STAMP_SIZE,
  TURB_W,
  WINGS,
} from '../constants/config';
import { overlaps, shrink, type Box } from '../game/collision';
import { generateLeg, type LegEntity } from '../game/legGenerator';
import { resolveTier, wingDelta, zoneBonus, zoneWidth } from '../game/landing';
import type { ChallengeRoute } from '../game/routes';
import {
  landingPoints,
  routeBonus,
  slipMultiplier,
  stampValue,
  type Tier,
} from '../game/scoring';
import { REGIONS, stampForLeg, type Perks, type RegionId } from '../game/stamps';
import {
  addTier,
  emptyTiers,
  type SessionMode,
  type SessionSummary,
} from '../game/session';
import { useGameLoop } from './useGameLoop';

export type Phase = 'flying' | 'approach' | 'landing' | 'resolved' | 'done';

export type LiveEntity = LegEntity & { x: number; dead: boolean; pop: number };

export type FlightParams = {
  mode: SessionMode;
  route?: ChallengeRoute;
  perks: Perks;
  speedFactor: number;
  turbFactor: number;
  laneH: number;
  seedSalt: number;
  paused: boolean;
  onFinish: (summary: SessionSummary) => void;
};

export type FlightState = {
  phase: Phase;
  legIndex: number;
  legs: number;
  lane: number;
  wings: number;
  slip: number;
  score: number;
  invulnerable: boolean;
  shakeKey: number;
  popKey: number;
  landRequested: boolean;
  forcedMiss: boolean;
  lastTier: Tier | null;
  lastTierX: number;
  entities: LiveEntity[];
  shieldLeft: number;
};

function laneBox(lane: number, laneH: number): { y: number; h: number } {
  const top = BOARD_FRAME + lane * laneH;
  return { y: top, h: laneH };
}

export function planeBox(lane: number, laneH: number): Box {
  const { y, h } = laneBox(lane, laneH);
  return {
    x: PLANE_X,
    y: y + Math.max(0, (h - PLANE_H) / 2),
    w: PLANE_W,
    h: PLANE_H,
  };
}

export function entityBox(e: LiveEntity, laneH: number): Box {
  const { y, h } = laneBox(e.lane, laneH);
  if (e.kind === 'stamp') {
    return {
      x: e.x,
      y: y + Math.max(0, (h - STAMP_SIZE) / 2),
      w: STAMP_SIZE,
      h: STAMP_SIZE,
    };
  }
  return { x: e.x, y: y + 7, w: TURB_W, h: Math.max(12, h - 14) };
}

export function hits(e: LiveEntity, lane: number, laneH: number): boolean {
  return overlaps(
    shrink(planeBox(lane, laneH), HIT_SHRINK),
    entityBox(e, laneH),
  );
}

export function legSpeed(legIndex: number, factor: number): number {
  return Math.min(SPEED_CAP, BASE_SPEED + legIndex * SPEED_STEP) * factor;
}

export function regionForLeg(
  mode: SessionMode,
  legIndex: number,
  route?: ChallengeRoute,
): RegionId {
  if (route) {
    return route.region;
  }
  if (mode === 'daily') {
    return REGIONS[(legIndex + 1) % REGIONS.length].id;
  }
  return REGIONS[legIndex % REGIONS.length].id;
}

export function useFlightSession(params: FlightParams) {
  const {
    mode,
    route,
    perks,
    speedFactor,
    turbFactor,
    laneH,
    seedSalt,
    paused,
    onFinish,
  } = params;

  const legs = route ? route.legs : LEGS_FREE;
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const stateRef = useRef<FlightState>({
    phase: 'flying',
    legIndex: 0,
    legs,
    lane: 1,
    wings: WINGS,
    slip: perks.warmStart ? 5 : 0,
    score: 0,
    invulnerable: false,
    shakeKey: 0,
    popKey: 0,
    landRequested: false,
    forcedMiss: false,
    lastTier: null,
    lastTierX: 0,
    entities: [],
    shieldLeft: perks.stormShield ? 1 : 0,
  });

  const timersRef = useRef({
    legElapsed: 0,
    phaseElapsed: 0,
    invulnLeft: 0,
    lastLaneChange: 0,
  });

  const tiersRef = useRef(emptyTiers());
  const stampsRef = useRef<string[]>([]);
  const legStampRef = useRef(false);
  const bestTierRef = useRef<Tier | null>(null);
  const finishedRef = useRef(false);

  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);

  const startLeg = useCallback(
    (legIndex: number) => {
      const speed = legSpeed(legIndex, speedFactor);
      const plan = generateLeg({
        legIndex,
        attempt: seedSalt + legIndex,
        speed,
        durationMs: LEG_DURATION_MS,
        startLane: 1,
        turbDensity: (route ? route.turbDensity : 1) * turbFactor,
        stampDensity: route ? route.stampDensity : 1,
      });
      const s = stateRef.current;
      s.phase = 'flying';
      s.legIndex = legIndex;
      s.lane = 1;
      s.landRequested = false;
      s.forcedMiss = false;
      s.lastTier = null;
      s.entities = plan.entities.map(e => ({ ...e, dead: false, pop: 0 }));
      if (perks.warmStart) {
        s.slip = Math.max(s.slip, 5);
      }
      timersRef.current.legElapsed = 0;
      timersRef.current.phaseElapsed = 0;
      timersRef.current.lastLaneChange = 0;
      legStampRef.current = false;
      setTick(t => t + 1);
    },
    [perks.warmStart, route, seedSalt, speedFactor, turbFactor],
  );

  useEffect(() => {
    startLeg(0);
    setReady(true);
  }, [startLeg]);

  const finish = useCallback(
    (completed: boolean) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      const s = stateRef.current;
      s.phase = 'done';
      const legsFlown = completed ? legs : s.legIndex;
      const bonus = completed ? routeBonus(legs, tiersRef.current.miss) : 0;
      const score = s.score + bonus;
      const summary: SessionSummary = {
        mode,
        routeId: route ? route.id : undefined,
        routeName: route
          ? route.name
          : mode === 'daily'
          ? 'DAILY ROUTE'
          : 'FREE FLIGHT',
        legs,
        legsFlown,
        score,
        completed,
        wingsLeft: s.wings,
        newStamps: stampsRef.current.slice(),
        tiers: tiersRef.current,
        bestLanding: bestTierRef.current,
        bestBefore: 0,
        isNewBest: false,
      };
      finishRef.current(summary);
    },
    [legs, mode, route],
  );

  /** Called by LandingStrip once the ring has actually stopped. */
  const resolveLanding = useCallback(
    (distancePx: number, ringX: number) => {
      const s = stateRef.current;
      if (s.phase !== 'landing') {
        return;
      }
      const bonus = zoneBonus(s.slip, perks);
      const tier: Tier = s.forcedMiss ? 'miss' : resolveTier(distancePx, bonus);
      s.lastTier = tier;
      s.lastTierX = ringX;
      s.score += landingPoints(tier);
      s.wings = Math.max(0, Math.min(WINGS, s.wings + wingDelta(tier)));
      tiersRef.current = addTier(tiersRef.current, tier);
      if (
        bestTierRef.current === null ||
        (tier === 'gold' && bestTierRef.current !== 'gold') ||
        (tier === 'silver' && bestTierRef.current === 'bronze')
      ) {
        bestTierRef.current = tier;
      }
      s.phase = 'resolved';
      timersRef.current.phaseElapsed = 0;
      setTick(t => t + 1);
    },
    [perks],
  );

  const requestLand = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'landing' || s.landRequested) {
      return;
    }
    s.landRequested = true;
    setTick(t => t + 1);
  }, []);

  const changeLane = useCallback((delta: number) => {
    const s = stateRef.current;
    if (s.phase !== 'flying') {
      return;
    }
    const next = Math.max(0, Math.min(LANES - 1, s.lane + delta));
    if (next === s.lane) {
      return;
    }
    s.lane = next;
    timersRef.current.lastLaneChange = timersRef.current.legElapsed;
    setTick(t => t + 1);
  }, []);

  const active =
    ready && !paused && stateRef.current.phase !== 'done' && laneH > 0;

  useGameLoop(active, dt => {
    const s = stateRef.current;
    const t = timersRef.current;

    if (t.invulnLeft > 0) {
      t.invulnLeft = Math.max(0, t.invulnLeft - dt);
      s.invulnerable = t.invulnLeft > 0;
    }

    if (s.phase === 'flying') {
      t.legElapsed += dt;
      const speed = legSpeed(s.legIndex, speedFactor);
      const dx = (speed * dt) / 1000;

      for (let i = 0; i < s.entities.length; i++) {
        const e = s.entities[i];
        if (e.dead) {
          if (e.pop > 0) {
            e.pop = Math.max(0, e.pop - dt);
          }
          continue;
        }
        e.x -= dx;
        if (e.x < -TURB_W - 20) {
          e.dead = true;
          continue;
        }
        if (e.lane !== s.lane) {
          continue;
        }
        if (!hits(e, s.lane, laneH)) {
          continue;
        }
        if (e.kind === 'stamp') {
          e.dead = true;
          e.pop = 260;
          s.score += stampValue(s.slip);
          s.slip += 1;
          s.popKey += 1;
          if (!legStampRef.current) {
            legStampRef.current = true;
            const stamp = stampForLeg(
              regionForLeg(mode, s.legIndex, route),
              s.legIndex,
            );
            if (!stampsRef.current.includes(stamp.id)) {
              stampsRef.current.push(stamp.id);
            }
          }
        } else if (t.invulnLeft <= 0) {
          e.dead = true;
          s.shakeKey += 1;
          t.invulnLeft = INVULN_MS;
          s.invulnerable = true;
          if (s.shieldLeft > 0) {
            s.shieldLeft -= 1;
          } else {
            s.wings -= 1;
            s.slip = 0;
          }
          if (s.wings <= 0) {
            finish(false);
            setTick(x => x + 1);
            return;
          }
        }
      }

      if (t.legElapsed >= LEG_DURATION_MS) {
        s.phase = 'approach';
        t.phaseElapsed = 0;
      }
    } else if (s.phase === 'approach') {
      t.phaseElapsed += dt;
      if (t.phaseElapsed >= APPROACH_MS) {
        s.phase = 'landing';
        t.phaseElapsed = 0;
      }
    } else if (s.phase === 'landing') {
      t.phaseElapsed += dt;
      if (!s.landRequested && t.phaseElapsed >= LAND_TIMEOUT_MS) {
        s.forcedMiss = true;
        s.landRequested = true;
      }
    } else if (s.phase === 'resolved') {
      t.phaseElapsed += dt;
      if (t.phaseElapsed >= RESOLVE_HOLD_MS) {
        const next = s.legIndex + 1;
        if (next >= legs) {
          finish(true);
        } else {
          startLeg(next);
        }
      }
    }

    setTick(x => x + 1);
  });

  const s = stateRef.current;
  const timers = timersRef.current;

  const hintVisible =
    s.phase === 'flying' &&
    (timers.legElapsed < HINT_VISIBLE_MS ||
      timers.legElapsed - timers.lastLaneChange > HINT_IDLE_MS);

  const multiplier = slipMultiplier(s.slip);
  const safeZoneW = useMemo(() => zoneWidth(s.slip, perks), [s.slip, perks]);

  const abandon = useCallback(() => {
    finishedRef.current = true;
    stateRef.current.phase = 'done';
  }, []);

  return {
    tick,
    state: s,
    phase: s.phase,
    legIndex: s.legIndex,
    legs,
    lane: s.lane,
    wings: s.wings,
    slip: s.slip,
    score: s.score,
    multiplier,
    safeZoneW,
    entities: s.entities,
    invulnerable: s.invulnerable,
    shakeKey: s.shakeKey,
    popKey: s.popKey,
    landRequested: s.landRequested,
    lastTier: s.lastTier,
    lastTierX: s.lastTierX,
    hintVisible,
    changeLane,
    requestLand,
    resolveLanding,
    abandon,
  };
}

export default useFlightSession;
