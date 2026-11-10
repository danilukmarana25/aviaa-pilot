import {
  LANES,
  PLANE_W,
  PLANE_X,
  STAMP_INTERVAL_MS,
  TURB_INTERVAL_MS,
  TURB_W,
} from '../constants/config';
import { makeSeed, mulberry32, randInt, randRange, type Rng } from './rng';

export type EntityKind = 'stamp' | 'turb';

export type LegEntity = {
  id: string;
  kind: EntityKind;
  lane: number;
  /** World x at leg start. The world scrolls right-to-left, so x only decreases. */
  x: number;
  spriteIndex: number;
};

export type LegPlan = {
  seed: number;
  entities: LegEntity[];
  startLane: number;
  fallback: boolean;
  attempts: number;
};

export type LegParams = {
  legIndex: number;
  attempt: number;
  speed: number;
  durationMs: number;
  startLane?: number;
  /** >1 = denser turbulence (challenge routes, STORM difficulty) */
  turbDensity?: number;
  stampDensity?: number;
};

/** The three opener bands that make a no-input run end in about 3 seconds. */
export const OPENER_HIT_TIMES = [0.9, 1.9, 2.8];

function openerX(speed: number, tHit: number): number {
  return PLANE_X + PLANE_W + speed * tHit;
}

/** Lanes a turbulence group occupies, grouped by x proximity. */
type Group = { x: number; blocked: number[] };

function groupTurbulence(entities: LegEntity[]): Group[] {
  const turbs = entities
    .filter(e => e.kind === 'turb')
    .slice()
    .sort((a, b) => a.x - b.x);
  const groups: Group[] = [];
  for (const t of turbs) {
    const last = groups[groups.length - 1];
    if (last && Math.abs(t.x - last.x) < TURB_W) {
      if (!last.blocked.includes(t.lane)) {
        last.blocked.push(t.lane);
      }
    } else {
      groups.push({ x: t.x, blocked: [t.lane] });
    }
  }
  return groups;
}

function shiftAllowance(dx: number, speed: number): number {
  // A lane change settles in ~220 ms; allow one lane per that travel distance.
  const perLane = Math.max(1, speed * 0.25);
  return Math.max(1, Math.floor(dx / perLane));
}

/**
 * Walks the leg lane-by-lane and reports whether a clear line exists.
 * Returns the reachable lane set after each turbulence group.
 */
export function solvabilityWalk(
  entities: LegEntity[],
  startLane: number,
  speed: number,
): { ok: boolean; marks: { x: number; lanes: number[] }[] } {
  const groups = groupTurbulence(entities);
  const marks: { x: number; lanes: number[] }[] = [
    { x: PLANE_X, lanes: [startLane] },
  ];
  let reachable = [startLane];
  let prevX = PLANE_X;

  for (const g of groups) {
    if (g.blocked.length >= LANES) {
      return { ok: false, marks };
    }
    const shift = shiftAllowance(Math.max(1, g.x - prevX), speed);
    const next: number[] = [];
    for (let lane = 0; lane < LANES; lane++) {
      if (g.blocked.includes(lane)) {
        continue;
      }
      if (reachable.some(r => Math.abs(lane - r) <= shift)) {
        next.push(lane);
      }
    }
    if (next.length === 0) {
      return { ok: false, marks };
    }
    reachable = next;
    prevX = g.x;
    marks.push({ x: g.x, lanes: next });
  }
  return { ok: true, marks };
}

function reachableAt(
  marks: { x: number; lanes: number[] }[],
  x: number,
): number[] {
  let lanes = marks[0].lanes;
  for (const m of marks) {
    if (m.x <= x) {
      lanes = m.lanes;
    }
  }
  return lanes;
}

/** Every stamp must sit within one lane change of a lane the pilot can hold. */
export function stampsReachable(
  entities: LegEntity[],
  marks: { x: number; lanes: number[] }[],
): boolean {
  return entities
    .filter(e => e.kind === 'stamp')
    .every(s =>
      reachableAt(marks, s.x).some(l => Math.abs(l - s.lane) <= 1),
    );
}

function buildEntities(rng: Rng, p: Required<LegParams>): LegEntity[] {
  const { speed, durationMs, startLane, turbDensity, stampDensity } = p;
  const spanEnd = PLANE_X + PLANE_W + speed * (durationMs / 1000);
  const out: LegEntity[] = [];
  let n = 0;

  // Guaranteed openers in the starting lane — the "bad input" round-length contract.
  for (const t of OPENER_HIT_TIMES) {
    out.push({
      id: `o${n++}`,
      kind: 'turb',
      lane: startLane,
      x: openerX(speed, t),
      spriteIndex: 3,
    });
  }

  // Turbulence after the openers.
  let x = openerX(speed, OPENER_HIT_TIMES[OPENER_HIT_TIMES.length - 1]) + 180;
  while (x < spanEnd) {
    const lanes = [0, 1, 2];
    const count = rng() < 0.42 ? 2 : 1;
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = lanes[i];
      lanes[i] = lanes[j];
      lanes[j] = tmp;
    }
    for (let i = 0; i < count; i++) {
      out.push({
        id: `t${n++}`,
        kind: 'turb',
        lane: lanes[i],
        x,
        spriteIndex: 3,
      });
    }
    const gapMs =
      randRange(rng, TURB_INTERVAL_MS[0], TURB_INTERVAL_MS[1]) /
      Math.max(0.3, turbDensity);
    x += (speed * gapMs) / 1000;
  }

  // Stamps between the bands.
  let sx = PLANE_X + PLANE_W + speed * 1.3;
  while (sx < spanEnd) {
    out.push({
      id: `s${n++}`,
      kind: 'stamp',
      lane: randInt(rng, 0, LANES - 1),
      x: sx,
      spriteIndex: 2,
    });
    const gapMs =
      randRange(rng, STAMP_INTERVAL_MS[0], STAMP_INTERVAL_MS[1]) /
      Math.max(0.3, stampDensity);
    sx += (speed * gapMs) / 1000;
  }

  return out.sort((a, b) => a.x - b.x);
}

/** A guaranteed-playable hand-authored layout. The fallback is a guarantee, not the game. */
export function fallbackLeg(speed: number, startLane: number): LegEntity[] {
  const unit = speed * 0.9;
  const base = PLANE_X + PLANE_W;
  const rows: Array<[EntityKind, number, number]> = [
    ['turb', startLane, 1],
    ['stamp', (startLane + 1) % LANES, 1.6],
    ['turb', startLane, 2.1],
    ['stamp', (startLane + 2) % LANES, 2.6],
    ['turb', startLane, 3.1],
    ['stamp', 1, 4.2],
    ['turb', 0, 5.0],
    ['stamp', 2, 5.8],
    ['turb', 2, 6.6],
    ['stamp', 0, 7.4],
    ['turb', 1, 8.2],
    ['stamp', 1, 9.0],
  ];
  return rows.map(([kind, lane, mult], i) => ({
    id: `f${i}`,
    kind,
    lane,
    x: base + unit * mult,
    spriteIndex: kind === 'turb' ? 3 : 2,
  }));
}

export function generateLeg(params: LegParams): LegPlan {
  const p: Required<LegParams> = {
    startLane: 1,
    turbDensity: 1,
    stampDensity: 1,
    ...params,
  };
  const seed = makeSeed(p.legIndex, p.attempt);

  for (let attempt = 0; attempt < 20; attempt++) {
    const rng = mulberry32((seed + attempt * 2654435761) >>> 0);
    const entities = buildEntities(rng, p);
    const walk = solvabilityWalk(entities, p.startLane, p.speed);
    if (walk.ok && stampsReachable(entities, walk.marks)) {
      return {
        seed,
        entities,
        startLane: p.startLane,
        fallback: false,
        attempts: attempt + 1,
      };
    }
  }

  return {
    seed,
    entities: fallbackLeg(p.speed, p.startLane),
    startLane: p.startLane,
    fallback: true,
    attempts: 20,
  };
}
