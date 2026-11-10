import { BOARD_FRAME, LANES } from '../constants/config';

/** A lane change is one step and never leaves the airway. */
export function clampLane(lane: number, delta: number): number {
  return Math.max(0, Math.min(LANES - 1, lane + delta));
}

export function laneTop(lane: number, laneH: number): number {
  return BOARD_FRAME + lane * laneH;
}

export function laneCenterY(lane: number, laneH: number): number {
  return laneTop(lane, laneH) + laneH / 2;
}

export function laneHeight(areaH: number): number {
  return Math.floor((areaH - 2 * BOARD_FRAME) / LANES);
}
